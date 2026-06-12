import Link from "next/link";

const adminCards = [
  "Orders",
  "Tickets",
  "Payments",
  "Manual fallback confirmations",
  "Gate check-in",
  "Reports",
];

export default function AdminPage() {
  return (
    <main style={{ minHeight: "100vh", padding: 32, background: "#080808", color: "#f7f2e8", fontFamily: "Arial, sans-serif" }}>
      <section style={{ maxWidth: 1120, margin: "0 auto" }}>
        <p style={{ color: "#d6a84f", fontWeight: 700 }}>Admin Dashboard</p>
        <h1 style={{ fontSize: "clamp(38px, 7vw, 74px)", lineHeight: 0.95 }}>Ticketing Operations</h1>
        <p style={{ color: "#b8ac97", fontSize: 18, lineHeight: 1.6, maxWidth: 760 }}>
          This is the operational control center. Supabase Auth roles will separate admin, finance, and gate staff permissions.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16, marginTop: 28 }}>
          {adminCards.map((card) => (
            <div key={card} style={{ border: "1px solid #2f2617", borderRadius: 24, padding: 22, background: "#15120d" }}>
              <h2>{card}</h2>
              <p style={{ color: "#b8ac97" }}>Coming in the Supabase operations phase.</p>
            </div>
          ))}
        </div>
        <Link href="/conference/men-conference-2026" style={{ display: "inline-flex", marginTop: 28, background: "#d6a84f", color: "#120d04", padding: "14px 22px", borderRadius: 999, fontWeight: 800, textDecoration: "none" }}>
          View public ticket page
        </Link>
      </section>
    </main>
  );
}
