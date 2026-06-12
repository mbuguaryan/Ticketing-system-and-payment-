import ConferenceCheckout from "@/app/components/ConferenceCheckout";

export default function ConferencePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #3a2108 0%, #100906 42%, #050505 100%)",
        color: "#f7f2e8",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 20px 80px" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            marginBottom: 28,
          }}
        >
          <strong style={{ color: "#d6a84f", letterSpacing: 3 }}>KEITH MUOKI PRESENTS</strong>
          <a href="#tickets" style={smallGoldButtonStyle}>Book Now</a>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 28,
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                display: "inline-flex",
                border: "1px solid #d6a84f",
                borderRadius: 999,
                padding: "8px 14px",
                color: "#d6a84f",
                fontWeight: 800,
              }}
            >
              Sat 15 Aug 2026 · KICC Nairobi · Virtual Access Available
            </p>

            <h1
              style={{
                fontSize: "clamp(48px, 9vw, 104px)",
                lineHeight: 0.9,
                margin: "22px 0 14px",
                letterSpacing: -4,
              }}
            >
              Men’s Conference 2026
            </h1>

            <p style={{ color: "#d8c9ae", fontSize: 20, lineHeight: 1.6, maxWidth: 680 }}>
              A powerful men’s gathering for men ready to rise in leadership, purpose, mindset,
              family, faith, and brotherhood. Come sharpen your vision, strengthen your confidence,
              and leave with the clarity to become a better man.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 26 }}>
              <a href="#tickets" style={largeGoldButtonStyle}>Get Your Ticket</a>
              <a href="tel:0750886617" style={outlineButtonStyle}>Enquiries: 0750 886 617</a>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 12,
                marginTop: 28,
                maxWidth: 680,
              }}
            >
              <StatCard label="Physical" value="KICC Nairobi" />
              <StatCard label="Virtual" value="Online Access" />
              <StatCard label="Date" value="15 Aug 2026" />
            </div>
          </div>

          <div
            style={{
              border: "1px solid #3a2b14",
              borderRadius: 28,
              overflow: "hidden",
              background: "#150f09",
              boxShadow: "0 30px 80px rgba(0,0,0,.45)",
            }}
          >
            <img
              src="/mens-conference-poster.svg"
              alt="Men’s Conference 2026 poster"
              style={{ width: "100%", display: "block" }}
            />
          </div>
        </section>

        <ConferenceCheckout />
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: "1px solid #3a2b14", borderRadius: 18, padding: 16, background: "rgba(0,0,0,.28)" }}>
      <p style={{ color: "#b8ac97", margin: 0, fontSize: 13 }}>{label}</p>
      <strong style={{ color: "#f7f2e8", fontSize: 18 }}>{value}</strong>
    </div>
  );
}

const smallGoldButtonStyle = {
  background: "#d6a84f",
  color: "#130b02",
  padding: "12px 18px",
  borderRadius: 999,
  fontWeight: 800,
  textDecoration: "none",
} as const;

const largeGoldButtonStyle = {
  background: "#d6a84f",
  color: "#130b02",
  padding: "16px 24px",
  borderRadius: 999,
  fontWeight: 900,
  textDecoration: "none",
} as const;

const outlineButtonStyle = {
  border: "1px solid #3a2b14",
  color: "#f7f2e8",
  padding: "16px 24px",
  borderRadius: 999,
  fontWeight: 800,
  textDecoration: "none",
} as const;
