"use client";

import { useEffect, useState } from "react";
import { Button, Field, Panel, inputClass } from "@/components/ui";

type TicketType = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  delivery_mode: "physical" | "virtual";
};

export default function CheckoutPage() {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [selectedTicketTypeCode, setSelectedTicketTypeCode] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedTicketType = ticketTypes.find((ticketType) => ticketType.code === selectedTicketTypeCode);
  const totalAmount = selectedTicketType ? Number(selectedTicketType.price) * quantity : 0;
  const currency = selectedTicketType?.currency ?? "KES";

  useEffect(() => {
    fetch("/api/ticket-types")
      .then((response) => response.json())
      .then((body) => setTicketTypes(body.ticketTypes ?? []))
      .catch(() => setError("Ticket types could not be loaded."));
  }, []);

  async function submit(formData: FormData) {
    setLoading(true);
    setError("");

    const paymentResponse = await fetch("/api/payments/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_slug: "men-conference-2026",
        buyer_name: formData.get("buyer_name"),
        buyer_phone: formData.get("buyer_phone"),
        buyer_email: formData.get("buyer_email"),
        ticket_type_code: selectedTicketTypeCode,
        quantity
      })
    });
    const paymentBody = await paymentResponse.json();

    if (!paymentResponse.ok) {
      setLoading(false);
      setError(paymentBody.error ?? "Could not initialize payment.");
      return;
    }

    window.location.href = paymentBody.authorization_url;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Buy your ticket</h1>
      <p className="mt-2 text-slate-300">Choose your ticket, enter your details, and continue to secure Paystack payment.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_0.8fr]">
        <Panel>
          <form action={submit} className="grid gap-5">
            <Field label="Ticket type">
            <select
              name="ticket_type_id"
              required
              value={selectedTicketTypeCode}
              onChange={(event) => setSelectedTicketTypeCode(event.target.value)}
              className={inputClass}
            >
              <option value="">Select a ticket</option>
              {ticketTypes.map((ticketType) => (
                <option key={ticketType.id} value={ticketType.code}>
                  {ticketType.name} - {ticketType.currency} {Number(ticketType.price).toLocaleString()}
                </option>
              ))}
            </select>
            </Field>
            <Field label="Full name">
              <input name="buyer_name" required className={inputClass} />
            </Field>
            <Field label="Phone number">
              <input name="buyer_phone" required className={inputClass} />
            </Field>
            <Field label="Email address">
              <input name="buyer_email" type="email" className={inputClass} />
            </Field>
            <Field label="Quantity">
              <input
                name="quantity"
                type="number"
                min="1"
                max="20"
                value={quantity}
                onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                required
                className={inputClass}
              />
            </Field>
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            <Button disabled={loading || !selectedTicketTypeCode}>{loading ? "Opening Paystack..." : "Continue to Paystack"}</Button>
          </form>
        </Panel>

        <Panel className="h-fit space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Order summary</h2>
            <p className="mt-1 text-sm text-slate-400">Amount is calculated again on the server before payment.</p>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Ticket</span>
              <strong className="text-right text-white">{selectedTicketType?.name ?? "Not selected"}</strong>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Access</span>
              <strong className="capitalize text-white">{selectedTicketType?.delivery_mode ?? "-"}</strong>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Quantity</span>
              <strong className="text-white">{quantity}</strong>
            </div>
            <div className="border-t border-white/10 pt-3">
              <div className="flex justify-between gap-4">
                <span className="text-slate-300">Total due</span>
                <strong className="text-xl text-gold">{currency} {totalAmount.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </main>
  );
}
