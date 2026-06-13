import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { hashTicketToken } from "@/lib/tickets/ticket-codes";

const schema = z.object({
  ticket_code: z.string().min(1),
  token: z.string().optional().or(z.literal(""))
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const supabase = createServiceClient();
    const { data: ticket, error } = await supabase
      .from("tickets")
      .select("ticket_code, secure_token_hash, attendee_name, status, checked_in, checked_in_at, ticket_types(name, delivery_mode), orders(status)")
      .eq("ticket_code", input.ticket_code)
      .single();

    if (error || !ticket) {
      return NextResponse.json({ valid: false, reason: "Invalid ticket." }, { status: 200 });
    }

    if (input.token && ticket.secure_token_hash !== hashTicketToken(input.token)) {
      return NextResponse.json({ valid: false, reason: "Invalid ticket." }, { status: 200 });
    }

    const linkedOrder = ticket.orders as { status?: string } | Array<{ status?: string }> | null;
    const linkedTicketType = ticket.ticket_types as { name?: string; delivery_mode?: "physical" | "virtual" } | Array<{ name?: string; delivery_mode?: "physical" | "virtual" }> | null;
    const orderStatus = Array.isArray(linkedOrder) ? linkedOrder[0]?.status : linkedOrder?.status;
    if (orderStatus && orderStatus !== "paid") {
      return NextResponse.json({ valid: false, reason: "Order is not paid." }, { status: 200 });
    }

    return NextResponse.json({
      valid: ticket.status === "active" || ticket.status === "used",
      ticket: {
        ticket_code: ticket.ticket_code,
        attendee_name: ticket.attendee_name,
        ticket_type: Array.isArray(linkedTicketType) ? linkedTicketType[0]?.name : linkedTicketType?.name,
        delivery_mode: Array.isArray(linkedTicketType) ? linkedTicketType[0]?.delivery_mode : linkedTicketType?.delivery_mode,
        checked_in: ticket.checked_in,
        checked_in_at: ticket.checked_in_at,
        status: ticket.status
      },
      warning: ticket.checked_in ? "Ticket already used." : input.token ? null : "Manual lookup only. Scan the QR token before check-in."
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid verification request.";
    return NextResponse.json({ valid: false, reason: message }, { status: 400 });
  }
}
