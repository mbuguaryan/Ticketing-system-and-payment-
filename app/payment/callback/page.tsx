import Link from "next/link";
import { verifyPaystackTransaction } from "@/lib/paystack";

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
        <h1>Payment reference missing</h1>
        <p>Please try again.</p>
        <Link href="/conference/men-conference-2026">Back to tickets</Link>
      </main>
    );
  }

  try {
    const transaction = await verifyPaystackTransaction(reference);
    const paid = transaction.status === "success";
    const ticketCode = `MNC-${transaction.reference}`;
    const metadata = transaction.metadata || {};
    const ticketTypeId = typeof metadata.ticketTypeId === "string" ? metadata.ticketTypeId : "";
    const showScheduleLink = ticketTypeId === "virtual" || ticketTypeId === "group";

    return (
      <main>
        <h1>{paid ? "Payment Confirmed" : "Payment Not Complete"}</h1>
        <p>Reference: {transaction.reference}</p>
        {paid ? (
          <div>
            <p>Your payment has been verified. Your QR ticket is ready.</p>
            <p><Link href={`/ticket/${ticketCode}`}>View QR Ticket</Link></p>
            {showScheduleLink ? <p><Link href="/schedule">Open Scheduling</Link></p> : null}
          </div>
        ) : (
          <Link href="/conference/men-conference-2026">Try Again</Link>
        )}
      </main>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify payment.";

    return (
      <main>
        <h1>Verification failed</h1>
        <p>{message}</p>
        <Link href="/conference/men-conference-2026">Back to tickets</Link>
      </main>
    );
  }
}
