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
      <main style={pageStyle}>
        <section style={cardStyle}>
          <h1>Payment reference missing</h1>
          <p style={mutedStyle}>We could not find a Paystack payment reference. Please try again.</p>
          <Link href="/conference/men-conference-2026" style={buttonStyle}>Back to tickets</Link>
        </section>
      </main>
    );
  }

  try {
    const transaction = await verifyPaystackTransaction(reference);
    const paid = transaction.status === "success";
    const ticketCode = `MNC-${transaction.reference}`;

    return (
      <main style={pageStyle}>
        <section style={cardStyle}>
          <p style={{ color: "#d6a84f", fontWeight: 700 }}>Payment Verification</p>
          <h1>{paid ? "Payment Confirmed" : "Payment Not Complete"}</h1>
          <p style={mutedStyle}>
            {paid
              ? "Your payment has been verified. Your ticket can now be issued."
              : "Paystack returned this transaction, but it is not marked as successful yet."}
          </p>
          <p>Reference: <strong>{transaction.reference}</strong></p>
          {paid ? (
            <Link href={`/ticket/${ticketCode}`} style={buttonStyle}>View QR Ticket</Link>
          ) : (
            <Link href="/conference/men-conference-2026" style={buttonStyle}>Try Again</Link>
          )}
        </section>
      </main>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify payment.";

    return (
      <main style={pageStyle}>
        <section style={cardStyle}>
          <h1>Verification failed</h1>
          <p style={mutedStyle}>{message}</p>
          <Link href="/conference/men-conference-2026" style={buttonStyle}>Back to tickets</Link>
        </section>
      </main>
    );
  }
}

const pageStyle = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: 32,
  background: "#080808",
  color: "#f7f2e8",
  fontFamily: "Arial, sans-serif",
};

const cardStyle = {
  width: "min(720px, 100%)",
  border: "1px solid #2f2617",
  borderRadius: 24,
  padding: 28,
  background: "#15120d",
};

const mutedStyle = {
  color: "#b8ac97",
  lineHeight: 1.7,
  fontSize: 18,
};

const buttonStyle = {
  display: "inline-flex",
  marginTop: 18,
  background: "#d6a84f",
  color: "#120d04",
  padding: "14px 22px",
  borderRadius: 999,
  fontWeight: 800,
  textDecoration: "none",
};
