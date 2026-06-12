import { formatKes, ticketTypes } from "@/lib/ticket-types";

export default function ConferencePage() {
  return (
    <main style={{ minHeight: "100vh", padding: 32, background: "#080808", color: "#f7f2e8", fontFamily: "Arial, sans-serif" }}>
      <section style={{ maxWidth: 1120, margin: "0 auto" }}>
        <p style={{ color: "#d6a84f", fontWeight: 700 }}>Saturday 15 August 2026 · KICC Nairobi</p>
        <h1 style={{ fontSize: "clamp(40px, 7vw, 76px)", lineHeight: 0.95, margin: "12px 0" }}>
          Book Your Men Conference Ticket
        </h1>
        <p style={{ color: "#b8ac97", fontSize: 18, lineHeight: 1.6, maxWidth: 760 }}>
          Choose your ticket, enter your details, and complete payment securely through Paystack. Your QR ticket is issued only after payment is verified.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16, margin: "32px 0" }}>
          {ticketTypes.map((ticket) => (
            <article key={ticket.id} style={{ border: "1px solid #2f2617", borderRadius: 24, padding: 22, background: "#15120d" }}>
              <h2 style={{ margin: 0 }}>{ticket.name}</h2>
              <p style={{ color: "#b8ac97" }}>{ticket.description}</p>
              <strong style={{ color: "#d6a84f", fontSize: 28 }}>
                {ticket.priceKes > 0 ? formatKes(ticket.priceKes) : "Contact Admin"}
              </strong>
            </article>
          ))}
        </div>

        <form action="/api/paystack/initialize" method="POST" style={{ display: "grid", gap: 14, maxWidth: 640, border: "1px solid #2f2617", borderRadius: 24, padding: 24, background: "#15120d" }}>
          <label style={{ display: "grid", gap: 8 }}>
            Full Name
            <input name="fullName" required placeholder="Your full name" style={inputStyle} />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            Email
            <input name="email" required type="email" placeholder="you@example.com" style={inputStyle} />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            Phone
            <input name="phone" required placeholder="07..." style={inputStyle} />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            Ticket Type
            <select name="ticketTypeId" required defaultValue="early-bird" style={inputStyle}>
              {ticketTypes.filter((ticket) => ticket.priceKes > 0).map((ticket) => (
                <option key={ticket.id} value={ticket.id}>
                  {ticket.name} · {formatKes(ticket.priceKes)}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            Quantity
            <input name="quantity" required type="number" min="1" max="20" defaultValue="1" style={inputStyle} />
          </label>

          <button type="submit" style={{ border: 0, borderRadius: 999, padding: "15px 22px", background: "#d6a84f", color: "#120d04", fontWeight: 800, cursor: "pointer" }}>
            Proceed to Paystack
          </button>
        </form>
      </section>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  border: "1px solid #2f2617",
  borderRadius: 14,
  padding: "14px 16px",
  background: "#0f0d09",
  color: "#f7f2e8",
  fontSize: 16,
} as const;
