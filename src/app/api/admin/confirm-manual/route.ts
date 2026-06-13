import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { createQrDataUrl, createTicketVerificationUrl } from "@/lib/tickets/qr";
import { createRawTicketToken, createTicketCode, hashTicketToken } from "@/lib/tickets/ticket-codes";

const schema = z.object({
  order_id: z.string().uuid(),
  paid_amount: z.coerce.number().positive(),
  bank_reference: z.string().min(2),
  notes: z.string().optional(),
  admin_key: z.string().optional()
});

function assertAdminKey(adminKey?: string) {
  const configuredKey = process.env.ADMIN_CONFIRMATION_KEY;
  if (configuredKey && adminKey !== configuredKey) {
    throw new Error("Invalid admin confirmation key.");
  }

  if (!configuredKey && process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_CONFIRMATION_KEY must be set in production.");
  }
}

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    assertAdminKey(input.admin_key);

    const supabase = createServiceClient();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, event_id, buyer_name, buyer_phone, buyer_email, total_amount, currency, status")
      .eq("id", input.order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (Number(input.paid_amount) < Number(order.total_amount)) {
      return NextResponse.json({ error: "Paid amount is less than order total." }, { status: 400 });
    }

    const { data: existingTickets } = await supabase
      .from("tickets")
      .select("ticket_code, attendee_name, qr_code_url, status")
      .eq("order_id", order.id);

    await supabase
      .from("orders")
      .update({
        status: "paid",
        provider_reference: input.bank_reference,
        admin_notes: input.notes ?? null,
        updated_at: new Date().toISOString()
      })
      .eq("id", order.id);

    const { data: intent } = await supabase
      .from("payment_intents")
      .select("id")
      .eq("order_id", order.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (intent) {
      await supabase
        .from("payment_intents")
        .update({ status: "paid", provider_reference: input.bank_reference, updated_at: new Date().toISOString() })
        .eq("id", intent.id);
    }

    await supabase.from("payment_logs").insert({
      order_id: order.id,
      payment_intent_id: intent?.id ?? null,
      provider: "manual_pesalink",
      event_type: "manual_confirmation",
      provider_reference: input.bank_reference,
      amount: input.paid_amount,
      currency: order.currency,
      status: "paid",
      raw_payload: { notes: input.notes ?? null }
    });

    if (existingTickets && existingTickets.length > 0) {
      return NextResponse.json({ tickets: existingTickets, reusedExistingTickets: true });
    }

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("ticket_type_id, quantity")
      .eq("order_id", order.id);

    if (itemsError || !items?.length) {
      return NextResponse.json({ error: "Order has no ticket items." }, { status: 400 });
    }

    const { count } = await supabase.from("tickets").select("id", { count: "exact", head: true });
    let sequence = (count ?? 0) + 1;
    const ticketsToInsert = [];

    for (const item of items) {
      for (let index = 0; index < item.quantity; index += 1) {
        const ticketCode = createTicketCode(sequence);
        const rawToken = createRawTicketToken();
        const verificationUrl = createTicketVerificationUrl(ticketCode, rawToken);
        ticketsToInsert.push({
          event_id: order.event_id,
          order_id: order.id,
          ticket_type_id: item.ticket_type_id,
          ticket_code: ticketCode,
          secure_token_hash: hashTicketToken(rawToken),
          attendee_name: order.buyer_name,
          attendee_phone: order.buyer_phone,
          attendee_email: order.buyer_email,
          qr_code_url: await createQrDataUrl(verificationUrl),
          status: "active"
        });
        sequence += 1;
      }

      await supabase.rpc("increment_ticket_type_sold", {
        ticket_type_id_input: item.ticket_type_id,
        quantity_input: item.quantity
      });
    }

    const { data: tickets, error: ticketError } = await supabase
      .from("tickets")
      .insert(ticketsToInsert)
      .select("ticket_code, attendee_name, qr_code_url, status");

    if (ticketError) {
      return NextResponse.json({ error: "Could not generate tickets." }, { status: 500 });
    }

    await supabase.from("audit_logs").insert({
      action: "confirm_manual_payment",
      entity_type: "order",
      entity_id: order.id,
      metadata: { bank_reference: input.bank_reference, paid_amount: input.paid_amount }
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid confirmation request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
