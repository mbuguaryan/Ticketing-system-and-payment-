import QRCode from "qrcode";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ ticketCode: string }>;
}) {
  const { ticketCode } = await params;
  const ticketUrl = `${process.env.APP_BASE_URL || "http://localhost:3000"}/verify-ticket?code=${encodeURIComponent(ticketCode)}`;
  const qrDataUrl = await QRCode.toDataURL(ticketUrl, { margin: 2, width: 280 });

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 32, background: "#080808", color: "#f7f2e8", fontFamily: "Arial, sans-serif" }}>
      <section style={{ width: "min(760px, 100%)", border: "1px solid #2f2617", borderRadius: 28, padding: 28, background: "#15120d", textAlign: "center" }}>
        <p style={{ color: "#d6a84f", fontWeight: 700 }}>Men Conference Nairobi 2026</p>
        <h1 style={{ fontSize: "clamp(34px, 6vw, 64px)", margin: "10px 0" }}>Your Ticket</h1>
        <p style={{ color: "#b8ac97", lineHeight: 1.6 }}>
          Present this QR code at the gate. The ticket must be checked in only once.
        </p>
        <img src={qrDataUrl} alt="Ticket QR code" width="280" height="280" style={{ background: "white", padding: 12, borderRadius: 18, marginTop: 18 }} />
        <p style={{ color: "#b8ac97" }}>Ticket Code</p>
        <strong style={{ fontSize: 18, wordBreak: "break-all" }}>{ticketCode}</strong>
      </section>
    </main>
  );
}
