import QRCode from "qrcode";
import Link from "next/link";
import { getTicketByCode } from "@/lib/ticketing";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ ticketCode: string }>;
}) {
  const { ticketCode } = await params;
  const ticket = await getTicketByCode(ticketCode);

  if (!ticket) {
    return (
      <main style={mainStyle}>
        <section style={cardStyle}>
          <h1>Ticket Not Found</h1>
          <p>This ticket code does not exist or has not been issued yet.</p>
          <Link href="/conference/men-conference-2026" style={linkStyle}>Back to tickets</Link>
        </section>
      </main>
    );
  }

  const ticketUrl = `${process.env.APP_BASE_URL || "http://localhost:3000"}/verify-ticket?code=${encodeURIComponent(ticket.ticket_code)}`;
  const qrDataUrl = await QRCode.toDataURL(ticketUrl, { margin: 2, width: 280 });
  const ticketType = ticket.ticket_types;
  const order = ticket.ticket_orders;
  const event = order?.events;
  const isVirtual = ticketType?.delivery_mode === "virtual";
  const pdfUrl = `/api/tickets/${encodeURIComponent(ticket.ticket_code)}/pdf`;

  return (
    <main style={mainStyle}>
      <section style={cardStyle}>
        <p style={{ color: "#d6a84f", fontWeight: 800 }}>{event?.name || "Men’s Conference 2026"}</p>
        <h1 style={{ fontSize: "clamp(34px, 6vw, 64px)", margin: "10px 0" }}>
          {isVirtual ? "Your Virtual Ticket" : "Your Ticket"}
        </h1>

        <img src={qrDataUrl} alt="Ticket QR code" width="280" height="280" style={{ background: "white", padding: 12, borderRadius: 18, marginTop: 18 }} />

        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginTop: 22 }}>
          <a href={pdfUrl} style={primaryButtonStyle}>Download PDF Ticket</a>
          <Link href="/conference/men-conference-2026#tickets" style={secondaryButtonStyle}>Buy Another Ticket</Link>
        </div>

        <div style={{ display: "grid", gap: 10, marginTop: 24, textAlign: "left" }}>
          <Info label="Ticket Code" value={ticket.ticket_code} />
          <Info label="Ticket Type" value={ticketType?.name || "Ticket"} />
          <Info label="Holder" value={ticket.holder_name} />
          <Info label="Status" value={ticket.status} />
          <Info label="Date" value={event?.event_date || "15 August 2026"} />
          <Info label={isVirtual ? "Access" : "Venue"} value={isVirtual ? "Online Access" : event?.venue || "KICC Nairobi"} />
        </div>

        {isVirtual ? (
          <div style={{ border: "1px solid #3a2b14", borderRadius: 18, padding: 18, marginTop: 22, textAlign: "left" }}>
            <strong>Virtual access instructions</strong>
            <p style={{ color: "#b8ac97", lineHeight: 1.6 }}>
              This is a virtual ticket. Keep your PDF copy and follow the virtual access instructions after confirmation.
            </p>
            <Link href={`/schedule?ticketCode=${encodeURIComponent(ticket.ticket_code)}`} style={linkStyle}>Open Virtual Access Page</Link>
          </div>
        ) : (
          <p style={{ color: "#b8ac97", lineHeight: 1.6 }}>
            Download the PDF or show this QR code at the gate. The ticket must be checked in only once.
          </p>
        )}
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ borderBottom: "1px solid #2f2617", paddingBottom: 10 }}>
      <p style={{ margin: 0, color: "#b8ac97", fontSize: 13 }}>{label}</p>
      <strong style={{ wordBreak: "break-all" }}>{value}</strong>
    </div>
  );
}

const mainStyle = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: 32,
  background: "#080808",
  color: "#f7f2e8",
  fontFamily: "Arial, sans-serif",
} as const;

const cardStyle = {
  width: "min(760px, 100%)",
  border: "1px solid #2f2617",
  borderRadius: 28,
  padding: 28,
  background: "#15120d",
  textAlign: "center",
} as const;

const primaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  padding: "14px 20px",
  background: "#d6a84f",
  color: "#120d04",
  fontWeight: 900,
  textDecoration: "none",
} as const;

const secondaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  padding: "14px 20px",
  border: "1px solid #3a2b14",
  color: "#f7f2e8",
  fontWeight: 900,
  textDecoration: "none",
} as const;

const linkStyle = {
  color: "#d6a84f",
  fontWeight: 800,
} as const;
