import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", padding: 32, background: "#080808", color: "#f7f2e8", fontFamily: "Arial, sans-serif" }}>
      <section style={{ maxWidth: 980, margin: "0 auto", paddingTop: 80 }}>
        <p style={{ color: "#d6a84f", fontWeight: 700 }}>Keith Muoki Presents</p>
        <h1 style={{ fontSize: "clamp(42px, 8vw, 88px)", lineHeight: 0.95, margin: "12px 0" }}>
          Men Conference Nairobi 2026
        </h1>
        <p style={{ color: "#b8ac97", fontSize: 20, lineHeight: 1.6, maxWidth: 720 }}>
          A Paystack-powered ticketing and QR check-in system for a powerful gathering of men in Nairobi.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
          <Link href="/conference/men-conference-2026" style={{ background: "#d6a84f", color: "#120d04", padding: "14px 22px", borderRadius: 999, fontWeight: 800, textDecoration: "none" }}>
            Buy Ticket
          </Link>
          <Link href="/verify-ticket" style={{ border: "1px solid #2f2617", color: "#f7f2e8", padding: "14px 22px", borderRadius: 999, fontWeight: 800, textDecoration: "none" }}>
            Verify Ticket
          </Link>
        </div>
      </section>
    </main>
  );
}
