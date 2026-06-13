import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("ticket_types")
    .select("id, code, name, description, price, currency, delivery_mode, quantity_limit, tickets_sold")
    .eq("is_active", true)
    .eq("is_public", true)
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Could not load ticket types." }, { status: 500 });
  }

  return NextResponse.json({ ticketTypes: data ?? [] });
}
