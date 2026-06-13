import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { createInternalReference } from "@/lib/tickets/ticket-codes";

const createOrderSchema = z.object({
  event_slug: z.string().min(1),
  buyer_name: z.string().min(2),
  buyer_phone: z.string().min(7),
  buyer_email: z.string().email().optional().or(z.literal("")),
  ticket_type_id: z.string().uuid(),
  quantity: z.coerce.number().int().positive().max(20)
});

export async function POST(request: Request) {
  try {
    const input = createOrderSchema.parse(await request.json());
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
      .select("id, price, currency, quantity_limit, tickets_sold, is_active, is_public")
      .eq("id", input.ticket_type_id)
      .eq("event_id", event.id)
      .single();

    if (ticketTypeError || !ticketType || !ticketType.is_active || !ticketType.is_public) {
      return NextResponse.json({ error: "Ticket type is not available." }, { status: 400 });
    }

    if (ticketType.quantity_limit && ticketType.tickets_sold + input.quantity > ticketType.quantity_limit) {
      return NextResponse.json({ error: "Not enough tickets remain for this ticket type." }, { status: 400 });
    }

    const subtotal = Number(ticketType.price) * input.quantity;
    const internalReference = createInternalReference();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        event_id: event.id,
        buyer_name: input.buyer_name,
        buyer_phone: input.buyer_phone,
        buyer_email: input.buyer_email || null,
        quantity: input.quantity,
        subtotal,
        service_fee: 0,
        total_amount: subtotal,
        currency: ticketType.currency,
        status: "pending",
        payment_method: "pesalink",
        payment_provider: "manual_pesalink",
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
      total_price: subtotal
    });

    if (itemError) {
      return NextResponse.json({ error: "Could not create order item." }, { status: 500 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid order request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
