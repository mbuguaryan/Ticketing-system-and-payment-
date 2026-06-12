import { formatKes, ticketTypes } from "@/lib/ticket-types";

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
              A powerful men’s gathering focused on leadership, purpose, mindset, family, faith,
              emotional strength, and becoming a better man. Attend live at KICC Nairobi or join
              virtually from outside Kenya through Zoom access coordinated with Calendly.
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
              <StatCard label="Virtual" value="Zoom Access" />
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
              src="/mens-conference-poster.jpg"
              alt="Men’s Conference 2026 poster"
              style={{ width: "100%", display: "block" }}
            />
          </div>
        </section>

        <section
          id="tickets"
          style={{
            marginTop: 54,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 28,
            alignItems: "start",
          }}
        >
          <div>
            <p style={{ color: "#d6a84f", fontWeight: 800, letterSpacing: 2 }}>TICKETS</p>
            <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", lineHeight: 1, margin: "0 0 18px" }}>
              Get your tickets
            </h2>
            <p style={{ color: "#b8ac97", fontSize: 18, lineHeight: 1.6 }}>
              Kindly choose your ticket type and quantity. Physical tickets are for KICC Nairobi.
              Virtual tickets are for men joining online from outside Kenya or those who cannot travel.
            </p>

            <div style={{ display: "grid", gap: 14, marginTop: 22 }}>
              {ticketTypes
                .filter((ticket) => ticket.isPublic && ticket.priceKes > 0)
                .map((ticket) => (
                  <article
                    key={ticket.id}
                    style={{
                      border: "1px solid #3a2b14",
                      borderRadius: 22,
                      padding: 20,
                      background: ticket.deliveryMode === "virtual"
                        ? "linear-gradient(135deg, #1a1308 0%, #111827 100%)"
                        : "linear-gradient(135deg, #18100a 0%, #0b0806 100%)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
                      <div>
                        <p style={{ color: "#d6a84f", margin: "0 0 8px", fontSize: 13, fontWeight: 800 }}>
                          {ticket.deliveryMode === "virtual" ? "ONLINE / INTERNATIONAL" : ticket.bestFor}
                        </p>
                        <h3 style={{ margin: 0, fontSize: 24 }}>{ticket.name}</h3>
                        <p style={{ color: "#b8ac97", margin: "8px 0" }}>{ticket.description}</p>
                        <p style={{ color: "#d6a84f", margin: 0, fontSize: 14 }}>
                          Closes on {ticket.closesAt}
                        </p>
                      </div>
                      <strong style={{ color: "#d6a84f", fontSize: 26, whiteSpace: "nowrap" }}>
                        {formatKes(ticket.priceKes)}
                      </strong>
                    </div>
                  </article>
                ))}
            </div>

            <div style={virtualNoticeStyle}>
              <strong style={{ color: "#f7f2e8" }}>Virtual access note:</strong>
              <p style={{ color: "#b8ac97", margin: "8px 0 0", lineHeight: 1.6 }}>
                Virtual ticket buyers will receive online access details after payment confirmation.
                Calendly will be used to coordinate the Zoom access/session details where needed.
              </p>
              <a href="/schedule" style={{ color: "#d6a84f", fontWeight: 800, display: "inline-flex", marginTop: 10 }}>
                View Calendly scheduling options
              </a>
            </div>
          </div>

          <form action="/api/paystack/initialize" method="POST" style={formStyle}>
            <h2 style={{ marginTop: 0 }}>Enter your details</h2>

            <label style={labelStyle}>
              Full Name
              <input name="fullName" required placeholder="Your full name" style={inputStyle} />
            </label>

            <label style={labelStyle}>
              Email
              <input name="email" required type="email" placeholder="you@example.com" style={inputStyle} />
            </label>

            <label style={labelStyle}>
              Phone Number
              <input name="phone" required placeholder="07... or international number" style={inputStyle} />
            </label>

            <label style={labelStyle}>
              Ticket Type
              <select name="ticketTypeId" required defaultValue="early-bird" style={inputStyle}>
                {ticketTypes
                  .filter((ticket) => ticket.isPublic && ticket.priceKes > 0)
                  .map((ticket) => (
                    <option key={ticket.id} value={ticket.id}>
                      {ticket.name} · {formatKes(ticket.priceKes)}
                    </option>
                  ))}
              </select>
            </label>

            <label style={labelStyle}>
              Quantity
              <input name="quantity" required type="number" min="1" max="20" defaultValue="1" style={inputStyle} />
            </label>

            <label style={checkboxStyle}>
              <input type="checkbox" required style={{ marginTop: 3 }} />
              I have read and agree to the Privacy Policy and Terms & Conditions.
            </label>

            <label style={checkboxStyle}>
              <input type="checkbox" name="marketingOptIn" style={{ marginTop: 3 }} />
              I accept to receive Men’s Conference updates, including virtual access instructions where applicable.
            </label>

            <button type="submit" style={submitButtonStyle}>Book Now</button>

            <p style={{ color: "#b8ac97", textAlign: "center", fontSize: 13, lineHeight: 1.5, marginTop: 14 }}>
              Secure checkout powered by Paystack. Your QR or virtual ticket is issued after payment confirmation.
            </p>
          </form>
        </section>
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

const formStyle = {
  border: "1px solid #3a2b14",
  borderRadius: 28,
  padding: 24,
  background: "#100c08",
  position: "sticky",
  top: 20,
} as const;

const labelStyle = {
  display: "grid",
  gap: 8,
  color: "#f7f2e8",
  fontWeight: 800,
  marginTop: 14,
} as const;

const inputStyle = {
  width: "100%",
  border: "1px solid #3a2b14",
  borderRadius: 14,
  padding: "14px 16px",
  background: "#090706",
  color: "#f7f2e8",
  fontSize: 16,
} as const;

const checkboxStyle = {
  display: "flex",
  gap: 10,
  alignItems: "flex-start",
  color: "#cbbda2",
  fontSize: 14,
  lineHeight: 1.5,
  marginTop: 12,
} as const;

const submitButtonStyle = {
  width: "100%",
  border: 0,
  borderRadius: 999,
  padding: "16px 22px",
  background: "#d6a84f",
  color: "#120d04",
  fontWeight: 900,
  fontSize: 17,
  cursor: "pointer",
  marginTop: 20,
} as const;

const virtualNoticeStyle = {
  border: "1px solid #3a2b14",
  borderRadius: 22,
  padding: 20,
  background: "rgba(17, 24, 39, .55)",
  marginTop: 18,
} as const;
