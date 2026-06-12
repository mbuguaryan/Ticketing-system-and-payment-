import Link from "next/link";
import { finalizePaystackPayment } from "@/lib/ticketing";

export default async function PaymentCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const params = await searchParams;
  const reference = params.reference;

  if (!reference) {
    return (
      <main>
        <h1>Reference missing</h1>
        <p>Please try again.</p>
        <Link href="/conference/men-conference-2026">Back to tickets</Link>
      </main>
    );
  }

  try {
    const result = await finalizePaystackPayment(reference);
    const firstTicket = result.tickets[0];

    return (
      <main>
        <h1>{result.paid ? "Confirmed" : "Not Complete"}</h1>
        <p>Reference: {reference}</p>
        {result.paid ? (
          <div>
            <p>Your ticket has been issued.</p>
            {firstTicket ? <p><Link href={`/ticket/${firstTicket.ticket_code}`}>View Your Ticket</Link></p> : null}
            {result.requiresScheduling ? <p><Link href="/schedule">Open Calendly / Zoom Access</Link></p> : null}
          </div>
        ) : (
          <Link href="/conference/men-conference-2026">Try Again</Link>
        )}
      </main>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to complete request.";

    return (
      <main>
        <h1>Verification failed</h1>
        <p>{message}</p>
        <Link href="/conference/men-conference-2026">Back to tickets</Link>
      </main>
    );
  }
}
