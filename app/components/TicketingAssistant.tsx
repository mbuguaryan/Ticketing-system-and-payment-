"use client";

import { FormEvent, useState } from "react";

type Action = {
  label: string;
  href: string;
};

type Reply = {
  answer: string;
  primaryAction?: Action;
  secondaryAction?: Action;
};

export default function TicketingAssistant() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<Reply>({
    answer: "Ask about Early Bird tickets, Virtual tickets, Zoom access, group tickets, payment, or QR verification.",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const response = await fetch("/api/assistant/ticketing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = (await response.json()) as { reply?: Reply };

    if (data.reply) {
      setReply(data.reply);
    }

    setLoading(false);
  }

  return (
    <section style={{ border: "1px solid #2f2617", borderRadius: 24, padding: 22, background: "#15120d", marginTop: 28 }}>
      <p style={{ color: "#d6a84f", fontWeight: 700 }}>Ticketing Assistant</p>
      <p style={{ color: "#b8ac97", lineHeight: 1.6 }}>{reply.answer}</p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        {reply.primaryAction ? (
          <a href={reply.primaryAction.href} style={{ background: "#d6a84f", color: "#120d04", padding: "10px 14px", borderRadius: 999, fontWeight: 800, textDecoration: "none" }}>
            {reply.primaryAction.label}
          </a>
        ) : null}
        {reply.secondaryAction ? (
          <a href={reply.secondaryAction.href} style={{ border: "1px solid #2f2617", color: "#f7f2e8", padding: "10px 14px", borderRadius: 999, fontWeight: 800, textDecoration: "none" }}>
            {reply.secondaryAction.label}
          </a>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ask about tickets, Zoom, groups, or payment"
          style={{ border: "1px solid #2f2617", borderRadius: 14, padding: "14px 16px", background: "#0f0d09", color: "#f7f2e8", fontSize: 16 }}
        />
        <button type="submit" disabled={loading} style={{ border: 0, borderRadius: 999, padding: "13px 20px", background: "#d6a84f", color: "#120d04", fontWeight: 800, cursor: "pointer" }}>
          {loading ? "Loading..." : "Ask Assistant"}
        </button>
      </form>
    </section>
  );
}
