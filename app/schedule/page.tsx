import Link from "next/link";
import { schedulingOptions } from "@/lib/scheduling";

export default function SchedulePage() {
  return (
    <main style={{ minHeight: "100vh", padding: 32, background: "#080808", color: "#f7f2e8", fontFamily: "Arial, sans-serif" }}>
      <section style={{ maxWidth: 1000, margin: "0 auto", paddingTop: 60 }}>
        <p style={{ color: "#d6a84f", fontWeight: 700 }}>Calendly + Zoom Scheduling</p>
        <h1 style={{ fontSize: "clamp(38px, 7vw, 74px)", lineHeight: 0.95 }}>
          Schedule the Right Session
        </h1>
        <p style={{ color: "#b8ac97", fontSize: 18, lineHeight: 1.6, maxWidth: 760 }}>
          Use this page for virtual Zoom access, group-ticket planning, and ticket support. Calendly should be connected to Zoom so every eligible booking can automatically receive a Zoom meeting link.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginTop: 28 }}>
          {schedulingOptions.map((option) => (
            <article key={option.id} style={{ border: "1px solid #2f2617", borderRadius: 24, padding: 22, background: "#15120d" }}>
              <h2>{option.title}</h2>
              <p style={{ color: "#b8ac97", lineHeight: 1.6 }}>{option.description}</p>
              <p style={{ color: "#d6a84f", fontWeight: 700 }}>
                {option.usesZoom ? "Zoom enabled" : "Scheduling only"}
              </p>
              <a href={option.calendlyUrl} style={{ display: "inline-flex", background: "#d6a84f", color: "#120d04", padding: "12px 18px", borderRadius: 999, fontWeight: 800, textDecoration: "none" }}>
                Open Calendly
              </a>
            </article>
          ))}
        </div>

        <Link href="/conference/men-conference-2026" style={{ display: "inline-flex", marginTop: 28, color: "#f7f2e8" }}>
          Back to tickets
        </Link>
      </section>
    </main>
  );
}
