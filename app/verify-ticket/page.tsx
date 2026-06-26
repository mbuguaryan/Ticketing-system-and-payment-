import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { checkInPhysicalTicketByCode, getTicketByCode } from "@/lib/ticketing";

const SESSION_COOKIE = "admin_dashboard_session";

export default async function VerifyTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; checkIn?: string }>;
}) {
  const params = await searchParams;
  const code = params.code?.trim();
  const ticket = code ? await getTicketByCode(code) : null;
  const ticketType = ticket?.ticket_types;
  const order = ticket?.ticket_orders;
  const event = order?.events;
  const adminKey = process.env.ADMIN_CONFIRMATION_KEY;
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;
  const isUnlocked = Boolean(adminKey && session && safeCompare(session, signAdminSession(adminKey)));
  const canCheckIn = Boolean(ticket && ticketType?.delivery_mode !== "virtual");

  return (
    <main style={{ minHeight: "100vh", padding: 32, background: "#080808", color: "#f7f2e8", fontFamily: "Arial, sans-serif" }}>
      <section style={{ maxWidth: 760, margin: "0 auto", paddingTop: 80 }}>
        <p style={{ color: "#d6a84f", fontWeight: 700 }}>Gate Verification</p>
        <h1 style={{ fontSize: "clamp(36px, 7vw, 72px)", lineHeight: 0.95 }}>Verify Ticket</h1>

        <form method="GET" style={{ display: "grid", gap: 14, border: "1px solid #2f2617", borderRadius: 24, padding: 24, background: "#15120d", marginBottom: 20 }}>
          <label style={{ display: "grid", gap: 8 }}>
            Ticket Code
            <input name="code" defaultValue={code || ""} placeholder="Paste or scan ticket code" style={{ border: "1px solid #2f2617", borderRadius: 14, padding: "14px 16px", background: "#0f0d09", color: "#f7f2e8", fontSize: 16 }} />
          </label>
          <button type="submit" style={{ border: 0, borderRadius: 999, padding: "15px 22px", background: "#d6a84f", color: "#120d04", fontWeight: 800, cursor: "pointer" }}>
            Verify
          </button>
        </form>

        {code ? (
          <div style={{ border: "1px solid #2f2617", borderRadius: 24, padding: 24, background: "#15120d" }}>
            {ticket ? (
              <div>
                <p style={{ color: ticket.status === "valid" ? "#d6a84f" : "#ff9f9f", fontWeight: 900 }}>
                  {ticket.status === "valid" ? "VALID TICKET" : `TICKET STATUS: ${String(ticket.status).toUpperCase()}`}
                </p>
                <Info label="Ticket Code" value={ticket.ticket_code} />
                <Info label="Holder" value={ticket.holder_name} />
                <Info label="Ticket Type" value={ticketType?.name || "Ticket"} />
                <Info label="Access" value={ticketType?.delivery_mode === "virtual" ? "Virtual / Zoom" : "Physical / Gate"} />
                <Info label="Event" value={event?.name || "Men’s Conference 2026"} />
                <Info label="Venue" value={ticketType?.delivery_mode === "virtual" ? "Online" : event?.venue || "KICC Nairobi"} />
                {ticket.checked_in_at ? <Info label="Checked In At" value={new Date(ticket.checked_in_at).toLocaleString()} /> : null}
                {params.checkIn ? (
                  <p style={{ color: params.checkIn === "success" ? "#d6a84f" : "#ff9f9f", fontWeight: 900 }}>
                    {getCheckInMessage(params.checkIn)}
                  </p>
                ) : null}
                {canCheckIn ? (
                  <form action={checkInTicket} style={{ display: "grid", gap: 12, marginTop: 18 }}>
                    <input type="hidden" name="code" value={ticket.ticket_code} />
                    {!isUnlocked ? (
                      <input
                        name="password"
                        type="password"
                        placeholder="Admin password"
                        required
                        style={{ border: "1px solid #2f2617", borderRadius: 14, padding: "14px 16px", background: "#0f0d09", color: "#f7f2e8", fontSize: 16 }}
                      />
                    ) : null}
                    <button type="submit" style={{ border: 0, borderRadius: 999, padding: "15px 22px", background: "#d6a84f", color: "#120d04", fontWeight: 800, cursor: "pointer" }}>
                      Check In Physical Ticket
                    </button>
                  </form>
                ) : null}
              </div>
            ) : (
              <div>
                <p style={{ color: "#ff9f9f", fontWeight: 900 }}>TICKET NOT FOUND</p>
                <p style={{ color: "#b8ac97" }}>No issued ticket matches this code.</p>
              </div>
            )}
          </div>
        ) : null}
      </section>
    </main>
  );
}

async function checkInTicket(formData: FormData) {
  "use server";

  const code = String(formData.get("code") || "").trim();
  const password = String(formData.get("password") || "");
  const adminKey = process.env.ADMIN_CONFIRMATION_KEY;

  if (!code) {
    redirect("/verify-ticket?checkIn=missing-code");
  }

  if (!adminKey) {
    redirect(`/verify-ticket?code=${encodeURIComponent(code)}&checkIn=not-configured`);
  }

  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;
  const isUnlocked = Boolean(session && safeCompare(session, signAdminSession(adminKey)));

  if (!isUnlocked) {
    if (!password || !safeCompare(password, adminKey)) {
      redirect(`/verify-ticket?code=${encodeURIComponent(code)}&checkIn=unauthorized`);
    }

    cookieStore.set(SESSION_COOKIE, signAdminSession(adminKey), {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 8,
      path: "/verify-ticket",
    });
  }

  const result = await checkInPhysicalTicketByCode(code);
  redirect(`/verify-ticket?code=${encodeURIComponent(code)}&checkIn=${result.ok ? "success" : encodeURIComponent(result.message)}`);
}

function signAdminSession(adminKey: string) {
  return createHmac("sha256", adminKey).update("admin-dashboard").digest("hex");
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function getCheckInMessage(status: string) {
  const messages: Record<string, string> = {
    success: "Ticket checked in.",
    "missing-code": "Ticket code is required.",
    "not-configured": "Admin password is not configured.",
    unauthorized: "Incorrect admin password.",
  };

  return messages[status] || status;
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ borderBottom: "1px solid #2f2617", padding: "10px 0" }}>
      <p style={{ margin: 0, color: "#b8ac97", fontSize: 13 }}>{label}</p>
      <strong style={{ wordBreak: "break-all" }}>{value}</strong>
    </div>
  );
}
