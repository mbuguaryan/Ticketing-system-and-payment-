import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prepareTicketDelivery } from "@/lib/ticketing";

const SESSION_COOKIE = "admin_dashboard_session";

export async function GET(request: NextRequest) {
  if (!(await isAdminUnlocked())) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const ticketCode = request.nextUrl.searchParams.get("ticketCode")?.trim();

  if (!ticketCode) {
    return NextResponse.json({ ok: false, message: "ticketCode is required." }, { status: 400 });
  }

  const delivery = await prepareTicketDelivery(ticketCode);

  if (!delivery) {
    return NextResponse.json({ ok: false, message: "Ticket not found." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    sent: false,
    delivery,
  });
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
