import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const SESSION_COOKIE = "admin_dashboard_session";

type AttendeeExportRow = {
  ticket_code?: string;
  holder_name?: string;
  holder_email?: string;
  status?: string;
  checked_in_at?: string | null;
  ticket_types?: { name?: string; delivery_mode?: string } | null;
  ticket_orders?: { buyer_phone?: string; amount_kes?: number; paid_at?: string | null } | null;
};

export async function GET() {
  if (!(await isAdminUnlocked())) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("tickets")
    .select("ticket_code, holder_name, holder_email, status, checked_in_at, ticket_types(name, delivery_mode), ticket_orders(buyer_phone, amount_kes, paid_at)")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  const rows = [
    ["ticket_code", "holder_name", "holder_email", "phone", "ticket_type", "delivery_mode", "status", "amount_kes", "paid_at", "checked_in_at"],
    ...((data || []) as AttendeeExportRow[]).map((ticket) => [
      ticket.ticket_code,
      ticket.holder_name,
      ticket.holder_email,
      ticket.ticket_orders?.buyer_phone || "",
      ticket.ticket_types?.name || "",
      ticket.ticket_types?.delivery_mode || "",
      ticket.status,
      ticket.ticket_orders?.amount_kes || "",
      ticket.ticket_orders?.paid_at || "",
      ticket.checked_in_at || "",
    ]),
  ];

  const csv = rows.map((row) => row.map(formatCsvCell).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"men-conference-attendees.csv\"",
      "Cache-Control": "private, no-store",
    },
  });
}

function formatCsvCell(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

async function isAdminUnlocked() {
  const adminKey = process.env.ADMIN_CONFIRMATION_KEY;
  if (!adminKey) return false;

  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;
  return Boolean(session && safeCompare(session, signAdminSession(adminKey)));
}

function signAdminSession(adminKey: string) {
  return createHmac("sha256", adminKey).update("admin-dashboard").digest("hex");
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}
