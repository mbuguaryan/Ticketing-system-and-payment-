"use client";

import { useEffect, useState } from "react";
import { Button, Field, Panel, inputClass } from "@/components/ui";

type Order = {
  id: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_email: string | null;
  status: string;
  total_amount: number;
  currency: string;
  internal_reference: string;
  created_at: string;
};

export default function ManualConfirmationPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadOrders() {
    const response = await fetch("/api/admin/orders");
    const body = await response.json();
    if (response.ok) {
      setOrders(body.orders ?? []);
    } else {
      setError(body.error ?? "Could not load orders.");
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function submit(formData: FormData) {
    setMessage("");
    setError("");
    const response = await fetch("/api/admin/confirm-manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: selectedOrder?.id,
        paid_amount: formData.get("paid_amount"),
        bank_reference: formData.get("bank_reference"),
        notes: formData.get("notes"),
        admin_key: formData.get("admin_key")
      })
    });
    const body = await response.json();
    if (!response.ok) {
      setError(body.error ?? "Confirmation failed.");
      return;
    }
    setMessage(`Payment confirmed. ${body.tickets?.length ?? 0} ticket(s) available.`);
    setSelectedOrder(null);
    await loadOrders();
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-[1fr_0.9fr]">
      <section>
        <h1 className="text-3xl font-bold">Manual payment confirmation</h1>
        <p className="mt-2 text-slate-300">Confirm PesaLink payments and generate QR tickets.</p>
        <div className="mt-8 grid gap-3">
          {orders.map((order) => (
            <button
              key={order.id}
              type="button"
              onClick={() => setSelectedOrder(order)}
              className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-gold/60"
            >
              <div className="flex items-center justify-between gap-4">
                <strong>{order.buyer_name}</strong>
                <span className="text-gold">{order.currency} {Number(order.total_amount).toLocaleString()}</span>
              </div>
              <p className="mt-1 text-sm text-slate-300">{order.internal_reference} - {order.buyer_phone}</p>
            </button>
          ))}
          {orders.length === 0 ? <p className="text-sm text-slate-400">No pending orders.</p> : null}
        </div>
      </section>

      <Panel>
        {selectedOrder ? (
          <form action={submit} className="grid gap-5">
            <div>
              <h2 className="text-xl font-semibold">{selectedOrder.buyer_name}</h2>
              <p className="text-sm text-slate-300">{selectedOrder.internal_reference}</p>
            </div>
            <Field label="Paid amount">
              <input name="paid_amount" type="number" defaultValue={selectedOrder.total_amount} required className={inputClass} />
            </Field>
            <Field label="Bank reference">
              <input name="bank_reference" required className={inputClass} />
            </Field>
            <Field label="Notes">
              <textarea name="notes" rows={3} className={inputClass} />
            </Field>
            <Field label="Admin confirmation key">
              <input name="admin_key" type="password" className={inputClass} />
            </Field>
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
            <Button>Confirm payment and generate tickets</Button>
          </form>
        ) : (
          <p className="text-slate-300">Select an order to confirm.</p>
        )}
      </Panel>
    </main>
  );
}
