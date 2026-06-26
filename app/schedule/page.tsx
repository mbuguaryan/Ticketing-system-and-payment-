import Link from "next/link";
import { getVirtualSchedulingAccess } from "@/lib/ticketing";
import { buildCalendlyUrl, schedulingOptions } from "@/lib/scheduling";

type SchedulePageProps = {
  searchParams: Promise<{ ticketCode?: string }>;
};

export default async function SchedulePage({ searchParams }: SchedulePageProps) {
  const params = await searchParams;
  const ticketCode = params.ticketCode?.trim();
  const access = ticketCode ? await getVirtualSchedulingAccess(ticketCode) : null;
  const publicOptions = schedulingOptions.filter((option) => option.id !== "virtual-ticket-zoom");

  return (
    <main style={{ minHeight: "100vh", padding: 32, background: "#080808", color: "#f7f2e8", fontFamily: "Arial, sans-serif" }}>
      <section style={{ maxWidth: 1000, margin: "0 auto", paddingTop: 60 }}>
        <p style={{ color: "#d6a84f", fontWeight: 700 }}>Calendly + Zoom Access</p>
        <h1 style={{ fontSize: "clamp(38px, 7vw, 74px)", lineHeight: 0.95 }}>
          Virtual Ticket Access
        </h1>
        <p style={{ color: "#b8ac97", fontSize: 18, lineHeight: 1.6, maxWidth: 760 }}>
          Virtual Zoom scheduling is available after payment confirmation from the issued virtual ticket.
        </p>

        {access?.ok && access.calendlyUrl ? (
          <article style={featuredPanelStyle}>
            <p style={{ color: "#d6a84f", fontWeight: 900, margin: 0 }}>PAID VIRTUAL TICKET CONFIRMED</p>
            <h2 style={{ margin: "10px 0" }}>{access.ticket?.holder_name}</h2>
            <p style={{ color: "#b8ac97", lineHeight: 1.6 }}>
              Use the secure Calendly link below to schedule or confirm your Zoom access. Your ticket code and buyer details are prefilled for support matching.
            </p>
            <a href={access.calendlyUrl} style={primaryButtonStyle}>
              Open Virtual Calendly
            </a>
          </article>
        ) : (
          <article style={featuredPanelStyle}>
            <p style={{ color: ticketCode ? "#ffb4a6" : "#d6a84f", fontWeight: 900, margin: 0 }}>
              {ticketCode ? "VIRTUAL ACCESS NOT AVAILABLE" : "TICKET CODE REQUIRED"}
            </p>
            <p style={{ color: "#b8ac97", lineHeight: 1.6 }}>
              {access?.message || "Open this page from your paid virtual ticket so the system can verify access before showing the Calendly link."}
            </p>
            <Link href="/conference/men-conference-2026#tickets" style={secondaryButtonStyle}>
              Back to tickets
            </Link>
          </article>
        )}

        <h2 style={{ marginTop: 34 }}>Support Scheduling</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginTop: 16 }}>
          {publicOptions.map((option) => (
            <article key={option.id} style={cardStyle}>
              <h3>{option.title}</h3>
              <p style={{ color: "#b8ac97", lineHeight: 1.6 }}>{option.description}</p>
              <a href={buildCalendlyUrl(option.calendlyUrl)} style={secondaryButtonStyle}>
                Open Calendly
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

const featuredPanelStyle = {
  border: "1px solid #3a2b14",
  borderRadius: 24,
  padding: 24,
  background: "#15120d",
  marginTop: 28,
} as const;

const cardStyle = {
  border: "1px solid #2f2617",
  borderRadius: 24,
  padding: 22,
  background: "#15120d",
} as const;

const primaryButtonStyle = {
  display: "inline-flex",
  background: "#d6a84f",
  color: "#120d04",
  padding: "12px 18px",
  borderRadius: 999,
  fontWeight: 800,
  textDecoration: "none",
} as const;

const secondaryButtonStyle = {
  display: "inline-flex",
  border: "1px solid #3a2b14",
  color: "#f7f2e8",
  padding: "12px 18px",
  borderRadius: 999,
  fontWeight: 800,
  textDecoration: "none",
} as const;
