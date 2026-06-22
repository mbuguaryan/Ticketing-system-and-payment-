import Link from "next/link";
import MetaPurchaseEvent from "@/app/components/MetaPurchaseEvent";
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
      <main style={mainStyle}>
        <section style={cardStyle}>
          <p style={eyebrowStyle}>Payment Status</p>
          <h1 style={titleStyle}>Reference Missing</h1>
          <p style={bodyTextStyle}>We could not find the payment reference. Please return to the ticket page and try again.</p>
          <Link href="/conference/men-conference-2026#tickets" style={secondaryButtonStyle}>Back to tickets</Link>
        </section>
      </main>
    );
  }

  try {
    const result = await finalizePaystackPayment(reference);
    const firstTicket = result.tickets[0];
    const ticketType = firstTicket?.ticket_types;
    const ticketName = ticketType?.name || "Men’s Conference 2026 Ticket";
    const ticketCode = ticketType?.code || "men-conference-2026";
    const orderAmount = Number(result.order.amount_kes || 0);
    const orderCurrency = result.order.currency || "KES";

    return (
      <main style={mainStyle}>
        <section style={cardStyle}>
          <p style={eyebrowStyle}>Men’s Conference 2026</p>
          <div style={statusBadgeStyle}>{result.paid ? "Payment Confirmed" : "Payment Not Complete"}</div>
          <h1 style={titleStyle}>{result.paid ? "Your Ticket Is Ready" : "Please Complete Payment"}</h1>

          <div style={referenceBoxStyle}>
            <p style={{ margin: 0, color: "#b8ac97", fontSize: 13 }}>Reference</p>
            <strong style={{ wordBreak: "break-all" }}>{reference}</strong>
          </div>

          {result.paid ? (
            <div>
              <MetaPurchaseEvent
                value={orderAmount}
                currency={orderCurrency}
                eventId={reference}
                contentName={ticketName}
                contents={[
                  {
                    id: ticketCode,
                    quantity: result.tickets.length || 1,
                  },
                ]}
              />

              <p style={bodyTextStyle}>
                Thank you. Your payment has been verified and your secure ticket has been issued.
              </p>

              <div style={actionRowStyle}>
                {firstTicket ? (
                  <>
                    <Link href={`/ticket/${firstTicket.ticket_code}`} style={primaryButtonStyle}>View Your Ticket</Link>
                    <a href={`/api/tickets/${firstTicket.ticket_code}/pdf`} style={secondaryButtonStyle}>Download PDF Ticket</a>
                  </>
                ) : null}
                <Link href="/conference/men-conference-2026#tickets" style={secondaryButtonStyle}>Buy Another Ticket</Link>
              </div>

              {result.requiresScheduling ? (
                <div style={noticeStyle}>
                  <strong>Virtual Access</strong>
                  <p style={{ color: "#b8ac97", lineHeight: 1.6, marginBottom: 12 }}>
                    This order includes virtual access. Use the virtual access page for the online access details.
                  </p>
                  <Link href="/schedule" style={textLinkStyle}>Open Virtual Access Page</Link>
                </div>
              ) : null}
            </div>
          ) : (
            <div>
              <p style={bodyTextStyle}>{result.message}</p>
              <Link href="/conference/men-conference-2026#tickets" style={primaryButtonStyle}>Try Again</Link>
            </div>
          )}
        </section>
      </main>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to complete request.";

    return (
      <main style={mainStyle}>
        <section style={cardStyle}>
          <p style={eyebrowStyle}>Payment Status</p>
          <h1 style={titleStyle}>Verification Failed</h1>
          <p style={bodyTextStyle}>{message}</p>
          <Link href="/conference/men-conference-2026#tickets" style={secondaryButtonStyle}>Back to tickets</Link>
        </section>
      </main>
    );
  }
}

const mainStyle = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: 20,
  background: "radial-gradient(circle at top, #3a2108 0%, #100906 42%, #050505 100%)",
  color: "#f7f2e8",
  fontFamily: "Arial, sans-serif",
} as const;

const cardStyle = {
  width: "min(760px, 100%)",
  border: "1px solid #3a2b14",
  borderRadius: 30,
  padding: "clamp(22px, 5vw, 42px)",
  background: "linear-gradient(145deg, #15100a 0%, #090706 100%)",
  boxShadow: "0 35px 90px rgba(0,0,0,.48)",
} as const;

const eyebrowStyle = {
  color: "#d6a84f",
  fontWeight: 900,
  letterSpacing: 2,
  margin: 0,
} as const;

const statusBadgeStyle = {
  display: "inline-flex",
  marginTop: 18,
  border: "1px solid #d6a84f",
  borderRadius: 999,
  padding: "8px 14px",
  color: "#d6a84f",
  fontWeight: 900,
} as const;

const titleStyle = {
  fontSize: "clamp(38px, 8vw, 76px)",
  lineHeight: 0.95,
  margin: "18px 0",
} as const;

const bodyTextStyle = {
  color: "#d8c9ae",
  fontSize: 18,
  lineHeight: 1.7,
} as const;

const referenceBoxStyle = {
  border: "1px solid #3a2b14",
  borderRadius: 18,
  padding: 16,
  background: "rgba(0,0,0,.25)",
  margin: "20px 0",
} as const;

const actionRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 22,
} as const;

const primaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  padding: "15px 22px",
  background: "#d6a84f",
  color: "#120d04",
  fontWeight: 900,
  textDecoration: "none",
} as const;

const secondaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  padding: "15px 22px",
  border: "1px solid #3a2b14",
  color: "#f7f2e8",
  fontWeight: 900,
  textDecoration: "none",
} as const;

const noticeStyle = {
  border: "1px solid #3a2b14",
  borderRadius: 20,
  padding: 18,
  background: "rgba(17, 24, 39, .55)",
  marginTop: 22,
} as const;

const textLinkStyle = {
  color: "#d6a84f",
  fontWeight: 900,
} as const;
