import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, buyer_name, buyer_phone, buyer_email, status, total_amount, currency, internal_reference, created_at")
    .in("status", ["awaiting_payment", "pending"])
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: "Could not load orders." }, { status: 500 });
  }

  return NextResponse.json({ orders: data ?? [] });
}
