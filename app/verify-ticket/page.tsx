import { getTicketByCode } from "@/lib/ticketing";

export default async function VerifyTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const params = await searchParams;
  const code = params.code?.trim();
  const ticket = code ? await getTicketByCode(code) : null;
  const ticketType = ticket?.ticket_types;
  const order = ticket?.ticket_orders;
  const event = order?.events;

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
                <p style={{ color: "#b8ac97", lineHeight: 1.6 }}>
                  Authorized gate check-in will be handled through the protected check-in function.
                </p>
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ borderBottom: "1px solid #2f2617", padding: "10px 0" }}>
      <p style={{ margin: 0, color: "#b8ac97", fontSize: 13 }}>{label}</p>
      <strong style={{ wordBreak: "break-all" }}>{value}</strong>
    </div>
  );
}
