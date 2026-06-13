import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { hashTicketToken } from "@/lib/tickets/ticket-codes";

const schema = z.object({
  ticket_code: z.string().min(1),
  token: z.string().min(1),
  device_label: z.string().optional(),
  location_label: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const supabase = createServiceClient();
    const { data: ticket, error } = await supabase
      .from("tickets")
      .select("id, event_id, secure_token_hash, status, checked_in, ticket_types(delivery_mode), orders(status)")
      .eq("ticket_code", input.ticket_code)
      .single();

    const linkedOrder = ticket?.orders as { status?: string } | Array<{ status?: string }> | null | undefined;
    const orderStatus = Array.isArray(linkedOrder) ? linkedOrder[0]?.status : linkedOrder?.status;
    if (error || !ticket || ticket.secure_token_hash !== hashTicketToken(input.token)) {
      return NextResponse.json({ error: "Invalid ticket." }, { status: 400 });
    }

    if (ticket.checked_in || ticket.status === "used") {
      return NextResponse.json({ error: "Ticket already used." }, { status: 409 });
    }

    if (orderStatus && orderStatus !== "paid") {
      return NextResponse.json({ error: "Ticket order is not paid." }, { status: 400 });
    }

    const linkedTicketType = ticket.ticket_types as { delivery_mode?: string } | Array<{ delivery_mode?: string }> | null;
    const deliveryMode = Array.isArray(linkedTicketType) ? linkedTicketType[0]?.delivery_mode : linkedTicketType?.delivery_mode;
    if (deliveryMode === "virtual") {
      return NextResponse.json({ error: "Virtual tickets are not valid for physical gate check-in." }, { status: 400 });
    }

    await supabase
      .from("tickets")
      .update({
        checked_in: true,
        checked_in_at: new Date().toISOString(),
        status: "used"
      })
      .eq("id", ticket.id);

    await supabase.from("checkins").insert({
      event_id: ticket.event_id,
      ticket_id: ticket.id,
      checkin_method: "manual_code",
      device_label: input.device_label ?? null,
      location_label: input.location_label ?? null
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid check-in request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
