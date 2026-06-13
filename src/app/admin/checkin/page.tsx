"use client";

import Link from "next/link";
import { Field, Panel, inputClass } from "@/components/ui";

export default function GateCheckInPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Gate check-in</h1>
      <p className="mt-2 text-slate-300">Open the QR link from a ticket, or use manual verification below.</p>
      <Panel className="mt-8 grid gap-5">
        <Field label="Manual verification">
          <input
            className={inputClass}
            placeholder="Paste /verify-ticket?code=...&token=..."
            onKeyDown={(event) => {
              if (event.key === "Enter" && event.currentTarget.value) {
                window.location.href = event.currentTarget.value;
              }
            }}
          />
        </Field>
        <Link href="/verify-ticket" className="text-sm font-semibold text-gold">Open verification page</Link>
      </Panel>
    </main>
  );
}
