import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ticketTypes } from "@/lib/ticket-types";

const EVENT_SLUG = "men-conference-nairobi-2026";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, name, slug")
      .eq("slug", EVENT_SLUG)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { ok: false, message: "Event not found. Confirm the event migration is applied." },
        { status: 404 }
      );
    }

    const rows = ticketTypes
      .filter((ticket) => ticket.isPublic && ticket.priceKes > 0)
      .map((ticket, index) => ({
        event_id: event.id,
        code: ticket.id,
        name: ticket.name,
        price_kes: ticket.priceKes,
        currency: "KES",
        description: ticket.description,
        delivery_mode: ticket.deliveryMode,
        includes_zoom: ticket.includesZoom,
        requires_scheduling: ticket.requiresScheduling,
        is_public: true,
        sort_order: index + 1,
      }));

    const { data, error } = await supabase
      .from("ticket_types")
      .upsert(rows, { onConflict: "event_id,code" })
      .select("code, name, price_kes, is_public, delivery_mode");

    if (error) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: "Ticket types synced successfully.",
      event: event.slug,
      ticketTypes: data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sync ticket types.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
