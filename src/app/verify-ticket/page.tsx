"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Field, Panel, inputClass } from "@/components/ui";

type Verification = {
  valid: boolean;
  reason?: string;
  warning?: string | null;
  ticket?: {
    ticket_code: string;
    attendee_name: string;
    ticket_type?: string;
    delivery_mode?: "physical" | "virtual";
    checked_in: boolean;
    status: string;
  };
};

export default function VerifyTicketPage() {
  const [result, setResult] = useState<Verification | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");

  const verify = useCallback(async (ticketCode = code, rawToken = token) => {
    const response = await fetch("/api/tickets/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket_code: ticketCode, token: rawToken })
    });
    setResult(await response.json());
  }, [code, token]);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const codeParam = search.get("code") ?? "";
    const tokenParam = search.get("token") ?? "";
    setCode(codeParam);
    setToken(tokenParam);
    if (codeParam && tokenParam) verify(codeParam, tokenParam);
  }, [verify]);

  async function checkIn() {
    setCheckingIn(true);
    const response = await fetch("/api/tickets/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket_code: code, token, location_label: "Main Gate" })
    });
    if (response.ok) {
      await verify();
    } else {
      const body = await response.json();
      setResult({ valid: false, reason: body.error ?? "Check-in failed." });
    }
    setCheckingIn(false);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Verify ticket</h1>
      <Panel className="mt-8 grid gap-5">
        <Field label="Ticket code">
          <input value={code} onChange={(event) => setCode(event.target.value)} className={inputClass} />
        </Field>
        <Field label="Token">
          <input value={token} onChange={(event) => setToken(event.target.value)} className={inputClass} />
        </Field>
        <Button type="button" onClick={() => verify()}>Verify</Button>
        {result ? (
          <div className={`rounded-md p-4 ${result.valid ? "bg-emerald-400/10 text-emerald-200" : "bg-red-400/10 text-red-200"}`}>
            <p className="font-semibold">{result.valid ? "Valid ticket" : result.reason}</p>
            {result.ticket ? <p className="mt-2 text-sm">{result.ticket.attendee_name} - {result.ticket.ticket_type}</p> : null}
            {result.warning ? <p className="mt-2 text-sm text-amber-200">{result.warning}</p> : null}
            {result.valid && token && !result.ticket?.checked_in && result.ticket?.delivery_mode !== "virtual" ? (
              <Button type="button" onClick={checkIn} disabled={checkingIn} className="mt-4">
                {checkingIn ? "Checking in..." : "Check in"}
              </Button>
            ) : null}
            {result.ticket?.delivery_mode === "virtual" ? (
              <p className="mt-2 text-sm text-amber-200">Virtual tickets are not accepted at the physical gate.</p>
            ) : null}
          </div>
        ) : null}
      </Panel>
    </main>
  );
}
