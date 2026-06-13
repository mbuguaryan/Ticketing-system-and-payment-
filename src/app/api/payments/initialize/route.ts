import { NextResponse } from "next/server";
import { z } from "zod";
import { initializePaystackTransaction } from "@/lib/paystack";
import { createServiceClient } from "@/lib/supabase/server";
import { createInternalReference } from "@/lib/tickets/ticket-codes";

const schema = z.object({
  event_slug: z.string().min(1).default("men-conference-2026"),
  buyer_name: z.string().min(2),
  buyer_phone: z.string().min(7),
  buyer_email: z.string().email(),
  ticket_type_code: z.enum(["early-bird", "two-men", "five-men", "virtual"]),
  quantity: z.coerce.number().int().min(1).max(20)
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const supabase = createServiceClient();

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, status")
      .eq("slug", input.event_slug)
      .single();

    if (eventError || !event || event.status !== "published") {
      return NextResponse.json({ error: "Event is not available." }, { status: 400 });
    }

    const { data: ticketType, error: ticketTypeError } = await supabase
      .from("ticket_types")
      .select("id, code, price, currency, delivery_mode, quantity_limit, tickets_sold, is_active, is_public")
      .eq("event_id", event.id)
      .eq("code", input.ticket_type_code)
      .single();

    if (ticketTypeError || !ticketType || !ticketType.is_active || !ticketType.is_public) {
      return NextResponse.json({ error: "Ticket type is not available." }, { status: 400 });
    }

    if (ticketType.quantity_limit && ticketType.tickets_sold + input.quantity > ticketType.quantity_limit) {
      return NextResponse.json({ error: "Not enough tickets remain for this ticket type." }, { status: 400 });
    }

    const amount = Number(ticketType.price) * input.quantity;
    const internalReference = createInternalReference();
    const paymentReference = `PAY-${internalReference}`;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        event_id: event.id,
        buyer_name: input.buyer_name,
        buyer_phone: input.buyer_phone,
        buyer_email: input.buyer_email,
        quantity: input.quantity,
        subtotal: amount,
        service_fee: 0,
        total_amount: amount,
        currency: ticketType.currency,
        status: "pending",
        payment_method: "paystack",
        payment_provider: "paystack",
        payment_reference: paymentReference,
        internal_reference: internalReference
      })
      .select("id, internal_reference, total_amount, currency")
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Could not create order." }, { status: 500 });
    }

    const { error: itemError } = await supabase.from("order_items").insert({
      order_id: order.id,
      ticket_type_id: ticketType.id,
      quantity: input.quantity,
      unit_price: ticketType.price,
      total_price: amount
    });

    if (itemError) {
      return NextResponse.json({ error: "Could not create order item." }, { status: 500 });
    }

    const callbackUrl = process.env.PAYSTACK_CALLBACK_URL || `${process.env.APP_BASE_URL || "http://localhost:3000"}/payment/callback`;
    const transaction = await initializePaystackTransaction({
      email: input.buyer_email,
      amountKobo: amount * 100,
      reference: paymentReference,
      callbackUrl,
      metadata: {
        order_id: order.id,
        ticket_type_code: ticketType.code,
        delivery_mode: ticketType.delivery_mode,
        quantity: input.quantity,
        amount
      }
    });

    const { data: paymentIntent } = await supabase
      .from("payment_intents")
      .insert({
        order_id: order.id,
        provider: "paystack",
        provider_reference: transaction.reference,
        checkout_url: transaction.authorization_url,
        amount,
        currency: ticketType.currency,
        status: "pending",
        raw_response: transaction
      })
      .select("id")
      .single();

    await supabase
      .from("orders")
      .update({
        status: "awaiting_payment",
        payment_access_code: transaction.access_code,
        payment_authorization_url: transaction.authorization_url,
        updated_at: new Date().toISOString()
      })
      .eq("id", order.id);

    await supabase.from("payment_logs").insert({
      order_id: order.id,
      payment_intent_id: paymentIntent?.id ?? null,
      provider: "paystack",
      event_type: "transaction.initialize",
      provider_reference: transaction.reference,
      amount,
      currency: ticketType.currency,
      status: "pending",
      raw_payload: transaction
    });

    return NextResponse.json({ order, authorization_url: transaction.authorization_url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid payment request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
