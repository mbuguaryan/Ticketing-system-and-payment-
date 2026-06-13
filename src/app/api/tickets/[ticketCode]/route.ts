import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(_request: Request, { params }: { params: Promise<{ ticketCode: string }> }) {
  const { ticketCode } = await params;
  const supabase = createServiceClient();
  const { data: ticket, error } = await supabase
    .from("tickets")
    .select("ticket_code, attendee_name, attendee_phone, attendee_email, qr_code_url, status, checked_in, created_at, ticket_types(name, delivery_mode), events(name, venue, event_date), orders(status)")
    .eq("ticket_code", ticketCode)
    .single();

  const linkedOrder = ticket?.orders as { status?: string } | Array<{ status?: string }> | null | undefined;
  const orderStatus = Array.isArray(linkedOrder) ? linkedOrder[0]?.status : linkedOrder?.status;

  if (error || !ticket || orderStatus !== "paid") {
    return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  }

  return NextResponse.json({ ticket });
}
