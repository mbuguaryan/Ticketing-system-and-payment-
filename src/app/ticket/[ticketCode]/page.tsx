"use client";

import Image from "next/image";
import { use, useEffect, useState } from "react";
import { Panel } from "@/components/ui";

type TicketBody = {
  ticket: {
    ticket_code: string;
    attendee_name: string;
    attendee_phone: string;
    attendee_email: string | null;
    qr_code_url: string | null;
    status: string;
    checked_in: boolean;
    ticket_types?: { name: string; delivery_mode: "physical" | "virtual" } | { name: string; delivery_mode: "physical" | "virtual" }[];
    events?: { name: string; venue: string | null; event_date: string | null } | { name: string; venue: string | null; event_date: string | null }[];
  };
};

function first<T>(value: T | T[] | undefined): T | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function TicketPage({ params }: { params: Promise<{ ticketCode: string }> }) {
  const { ticketCode } = use(params);
  const [body, setBody] = useState<TicketBody | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/tickets/${ticketCode}`)
      .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
      .then(({ ok, data }) => (ok ? setBody(data) : setError(data.error ?? "Ticket not found.")))
      .catch(() => setError("Ticket could not be loaded."));
  }, [ticketCode]);

  const ticket = body?.ticket;
  const ticketType = first(ticket?.ticket_types);
  const event = first(ticket?.events);
  const isVirtual = ticketType?.delivery_mode === "virtual";

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Your ticket</h1>
      <Panel className="mt-8 text-center">
        {error ? <p className="text-red-300">{error}</p> : null}
        {ticket ? (
          <div className="grid gap-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">{event?.name ?? "2026 Men Conference Nairobi"}</p>
            <h2 className="text-2xl font-bold">{ticket.attendee_name}</h2>
            <p className="text-slate-300">{ticketType?.name ?? "Conference ticket"}</p>
            <p className="text-sm text-slate-300">
              {event?.event_date ? new Date(event.event_date).toLocaleDateString("en-KE", { dateStyle: "full" }) : "Saturday 15 August 2026"}
              {" - "}
              {isVirtual ? "Zoom/Online Access" : event?.venue ?? "KICC Nairobi"}
            </p>
            {ticket.qr_code_url ? (
              <Image
                src={ticket.qr_code_url}
                alt="Ticket QR code"
                width={256}
                height={256}
                unoptimized
                className="mx-auto rounded-md bg-white p-3"
              />
            ) : null}
            <p className="font-mono text-sm text-slate-300">{ticket.ticket_code}</p>
            <p className="text-sm text-emerald-300">Payment confirmed - {ticket.status}</p>
            {isVirtual ? (
              <a className="text-sm font-semibold text-gold" href={process.env.NEXT_PUBLIC_CALENDLY_VIRTUAL_EVENT_URL || "/schedule"}>
                Open virtual access scheduling
              </a>
            ) : (
              <p className="text-sm text-slate-300">Present this QR code at the KICC gate.</p>
            )}
          </div>
        ) : !error ? (
          <p className="text-slate-300">Loading ticket...</p>
        ) : null}
      </Panel>
    </main>
  );
}
