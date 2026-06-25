"use client";

import { useMemo, useState } from "react";
import { formatKes, ticketTypes } from "@/lib/ticket-types";

export default function ConferenceCheckout() {
  const [selectedTicketId, setSelectedTicketId] = useState("early-bird");
  const [quantity, setQuantity] = useState(1);

  const publicTickets = ticketTypes.filter((ticket) => ticket.isPublic && ticket.priceKes > 0);
  const selectedTicket = publicTickets.find((ticket) => ticket.id === selectedTicketId) || publicTickets[0];
  const totalAmount = useMemo(() => selectedTicket.priceKes * quantity, [quantity, selectedTicket.priceKes]);

  function selectTicket(ticketId: string) {
    setSelectedTicketId(ticketId);
    window.setTimeout(() => {
      document.getElementById("checkout-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <section
      id="tickets"
      style={{
        marginTop: 34,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: 22,
        alignItems: "start",
      }}
    >
      <div>
        <h2 style={{ fontSize: "clamp(30px, 5vw, 52px)", lineHeight: 1, margin: "0 0 18px" }}>
          Select Ticket
        </h2>

        <div style={{ display: "grid", gap: 12 }}>
          {publicTickets.map((ticket) => {
            const selected = ticket.id === selectedTicketId;

            return (
              <button
                key={ticket.id}
                type="button"
                onClick={() => selectTicket(ticket.id)}
                aria-pressed={selected}
                style={{
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                  border: selected ? "2px solid #d6a84f" : "1px solid #3a2b14",
                  borderRadius: 22,
                  padding: 20,
                  color: "#f7f2e8",
                  background: ticket.deliveryMode === "virtual"
                    ? "linear-gradient(135deg, #1a1308 0%, #111827 100%)"
                    : "linear-gradient(135deg, #18100a 0%, #0b0806 100%)",
                  boxShadow: selected ? "0 0 0 4px rgba(214, 168, 79, .12)" : "none",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
                  <div>
                    <p style={{ color: "#d6a84f", margin: "0 0 8px", fontSize: 13, fontWeight: 900 }}>
                      {ticket.deliveryMode === "virtual" ? "ONLINE / INTERNATIONAL" : ticket.bestFor}
                    </p>
                    <h3 style={{ margin: 0, fontSize: 24 }}>{ticket.name}</h3>
                    <p style={{ color: "#b8ac97", margin: "8px 0", fontSize: 16 }}>{ticket.description}</p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <strong style={{ color: "#d6a84f", fontSize: 26, whiteSpace: "nowrap" }}>
                      {formatKes(ticket.priceKes)}
                    </strong>
                    <p style={{ color: selected ? "#d6a84f" : "#b8ac97", fontWeight: 900, margin: "8px 0 0" }}>
                      {selected ? "Selected" : "Select"}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <form id="checkout-form" action="/api/paystack/initialize" method="POST" style={formStyle}>
        <p style={{ color: "#d6a84f", margin: 0, fontWeight: 900 }}>PAYMENT</p>
        <h2 style={{ margin: "8px 0 0" }}>{selectedTicket.name}</h2>
        <strong style={{ color: "#d6a84f", fontSize: 28 }}>{formatKes(selectedTicket.priceKes)}</strong>

        <input type="hidden" name="ticketTypeId" value={selectedTicket.id} />

        <label style={labelStyle}>
          Full Name
          <input name="fullName" required placeholder="Your full name" style={inputStyle} />
        </label>

        <label style={labelStyle}>
          Email
          <input name="email" required type="email" placeholder="you@example.com" style={inputStyle} />
        </label>

        <label style={labelStyle}>
          Phone
          <input name="phone" required type="tel" placeholder="0712 345 678" style={inputStyle} />
        </label>

        <label style={labelStyle}>
          Quantity
          <input
            name="quantity"
            required
            type="number"
            min="1"
            max="20"
            value={quantity}
            onChange={(event) => setQuantity(Math.max(1, Math.min(20, Number(event.target.value || 1))))}
            style={inputStyle}
          />
        </label>

        <div style={{ border: "1px solid #3a2b14", borderRadius: 18, padding: 16, marginTop: 16, background: "rgba(0,0,0,.2)" }}>
          <p style={{ margin: 0, color: "#b8ac97" }}>Total to pay</p>
          <strong style={{ color: "#d6a84f", fontSize: 30 }}>{formatKes(totalAmount)}</strong>
        </div>

        <button type="submit" style={submitButtonStyle}>
          Pay {formatKes(totalAmount)}
        </button>

        <p style={{ color: "#b8ac97", textAlign: "center", fontSize: 13, lineHeight: 1.5, marginTop: 14 }}>
          Your secure ticket is issued after payment confirmation.
        </p>
      </form>
    </section>
  );
}

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
