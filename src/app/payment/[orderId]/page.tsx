"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Panel } from "@/components/ui";

type OrderStatus = {
  order: {
    status: string;
    internal_reference: string;
    total_amount: number;
    currency: string;
  };
  tickets: Array<{ ticket_code: string }>;
  paymentInstructions: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    branch?: string;
    supportPhone?: string;
  } | null;
};

export default function PaymentPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      const response = await fetch(`/api/orders/${orderId}`);
      const body = await response.json();
      if (!active) return;
      if (!response.ok) {
        setError(body.error ?? "Could not load order.");
        return;
      }
      setStatus(body);
    }

    load();
    const interval = window.setInterval(load, 5000);
    const timeout = window.setTimeout(() => window.clearInterval(interval), 300000);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [orderId]);

  async function copyValue(label: string, value?: string | number) {
    if (!value) return;
    await navigator.clipboard.writeText(String(value));
    setCopiedField(label);
    window.setTimeout(() => setCopiedField(""), 1500);
  }

  function PaymentRow({ label, value, highlight = false }: { label: string; value?: string | number; highlight?: boolean }) {
    return (
      <div className="grid gap-2 rounded-md border border-white/10 bg-panel/70 p-3 sm:grid-cols-[120px_1fr_auto] sm:items-center">
        <span className="text-slate-400">{label}</span>
        <strong className={`break-words ${highlight ? "text-gold" : "text-white"}`}>{value || "-"}</strong>
        <button
          type="button"
          onClick={() => copyValue(label, value)}
          disabled={!value}
          className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-gold/60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {copiedField === label ? "Copied" : "Copy"}
        </button>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">PesaLink payment</h1>
      <p className="mt-2 text-slate-300">Pay the exact amount below and use the reference exactly as shown.</p>
      <Panel className="mt-8 space-y-4">
        {error ? <p className="text-red-300">{error}</p> : null}
        {status ? (
          <>
            <div className="grid gap-3 text-sm">
              <PaymentRow label="Amount" value={`${status.order.currency} ${Number(status.order.total_amount).toLocaleString()}`} highlight />
              <PaymentRow label="Bank" value={status.paymentInstructions?.bankName ?? "Bank details pending"} />
              <PaymentRow label="Account name" value={status.paymentInstructions?.accountName} />
              <PaymentRow label="Account number" value={status.paymentInstructions?.accountNumber} />
              {status.paymentInstructions?.branch ? <PaymentRow label="Branch" value={status.paymentInstructions.branch} /> : null}
              <PaymentRow label="Reference" value={status.order.internal_reference} highlight />
              <div className="flex justify-between gap-4 rounded-md bg-white/[0.04] p-3 text-sm">
                <span className="text-slate-400">Status</span>
                <strong className="capitalize text-white">{status.order.status.replace("_", " ")}</strong>
              </div>
            </div>
            {status.tickets.length > 0 ? (
              <div className="rounded-md border border-emerald-400/30 bg-emerald-400/10 p-4">
                <p className="font-semibold text-emerald-200">Payment confirmed. Ticket generated.</p>
                <Link className="mt-3 inline-flex text-sm font-semibold text-gold" href={`/ticket/${status.tickets[0].ticket_code}`}>
                  Open ticket
                </Link>
              </div>
            ) : (
              <div className="rounded-md border border-gold/20 bg-gold/10 p-4 text-sm text-slate-200">
                <p className="font-semibold text-gold">Waiting for manual confirmation.</p>
                <p className="mt-2 text-slate-300">
                  Keep this page open or come back later using the same link. Your ticket appears here after finance confirms the payment.
                </p>
                {status.paymentInstructions?.supportPhone ? (
                  <p className="mt-2 text-slate-300">Support: {status.paymentInstructions.supportPhone}</p>
                ) : null}
              </div>
            )}
          </>
        ) : (
          <p className="text-slate-300">Loading order...</p>
        )}
      </Panel>
    </main>
  );
}
