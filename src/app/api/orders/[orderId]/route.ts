import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(_request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const supabase = createServiceClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, status, internal_reference, total_amount, currency, buyer_name, buyer_phone, buyer_email")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const { data: tickets } = await supabase
    .from("tickets")
    .select("ticket_code, attendee_name, qr_code_url, status, checked_in")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  const { data: paymentIntent } = await supabase
    .from("payment_intents")
    .select("payment_instructions")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ order, tickets: tickets ?? [], paymentInstructions: paymentIntent?.payment_instructions ?? null });
}
