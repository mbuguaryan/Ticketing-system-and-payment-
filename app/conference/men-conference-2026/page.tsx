import Image from "next/image";
import ConferenceCheckout from "@/app/components/ConferenceCheckout";

export default function ConferencePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050302",
        color: "#f7f2e8",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "12px 12px 64px" }}>
        <div
          style={{
            border: "1px solid #3a2b14",
            borderRadius: 22,
            overflow: "hidden",
            background: "#050302",
            boxShadow: "0 24px 70px rgba(0,0,0,.45)",
            maxWidth: 760,
            margin: "0 auto",
          }}
        >
          <Image
            src="/mens-conference-poster.jpeg"
            alt="Men’s Conference 2026 poster"
            width={1360}
            height={1600}
            priority
            quality={92}
            sizes="(max-width: 480px) 94vw, (max-width: 960px) 82vw, 760px"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              objectFit: "contain",
            }}
          />
        </div>

        <section style={{ padding: "24px 4px 0" }}>
          <p style={{ color: "#d6a84f", fontWeight: 900, letterSpacing: 2, margin: 0 }}>
            KEITH MUOKI PRESENTS
          </p>
          <h1
            style={{
              fontSize: "clamp(38px, 10vw, 82px)",
              lineHeight: 0.92,
              margin: "14px 0",
              letterSpacing: -3,
            }}
          >
            Men’s Conference 2026
          </h1>
          <p style={{ color: "#d8c9ae", fontSize: 20, lineHeight: 1.6, maxWidth: 760 }}>
            A powerful gathering for men ready to rise in leadership, purpose, mindset, family,
            faith, and brotherhood. Come sharpen your vision, strengthen your confidence, and leave
            with the clarity to become a better man.
          </p>
        </section>

        <ConferenceCheckout />
      </section>
    </main>
  );
}
