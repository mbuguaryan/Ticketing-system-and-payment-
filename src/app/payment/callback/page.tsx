import Link from "next/link";
import { finalizePaystackPayment } from "@/lib/paystack";
import { Panel } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function PaymentCallbackPage({
  searchParams
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;

  if (!reference) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold">Payment not found</h1>
        <Panel className="mt-8">
          <p className="text-red-300">Missing Paystack reference.</p>
          <Link href="/checkout" className="mt-4 inline-flex text-sm font-semibold text-gold">Back to checkout</Link>
        </Panel>
      </main>
    );
  }

  try {
    const result = await finalizePaystackPayment(reference);
    const firstTicket = result.tickets[0];

    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold">Payment confirmed</h1>
        <Panel className="mt-8 space-y-4">
          <p className="text-emerald-300">Your payment was verified and your ticket has been issued.</p>
          {firstTicket ? (
            <Link href={`/ticket/${firstTicket.ticket_code}`} className="inline-flex rounded-md bg-gold px-4 py-2 text-sm font-semibold text-ink">
              Open ticket
            </Link>
          ) : null}
        </Panel>
      </main>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment could not be verified.";
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold">Payment failed</h1>
        <Panel className="mt-8">
          <p className="text-red-300">{message}</p>
          <Link href="/checkout" className="mt-4 inline-flex text-sm font-semibold text-gold">Back to checkout</Link>
        </Panel>
      </main>
    );
  }
}
