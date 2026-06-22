export default function ConferenceHeroPoster() {
  return (
    <section
      aria-label="Men’s Conference 2026 event poster"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "min(1060px, 118vw)",
        borderRadius: 24,
        background:
          "radial-gradient(circle at 50% 18%, rgba(255, 215, 124, .34) 0%, transparent 28%), linear-gradient(145deg, #fbad34 0%, #7d2118 38%, #3b120e 63%, #f2c568 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(255,255,255,.2) 0 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,.14) 0 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          opacity: 0.12,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "-14%",
          left: "12%",
          right: "12%",
          height: "54%",
          borderRadius: "0 0 999px 999px",
          background: "linear-gradient(180deg, rgba(80, 16, 12, .92), rgba(44, 9, 8, .78))",
          boxShadow: "0 42px 120px rgba(0,0,0,.3)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "inherit",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "clamp(28px, 5vw, 58px)",
          textAlign: "center",
          color: "#fff8e8",
        }}
      >
        <header>
          <p
            style={{
              margin: 0,
              color: "#ffe1a5",
              fontSize: "clamp(13px, 2vw, 22px)",
              fontWeight: 900,
              letterSpacing: "0.34em",
              textTransform: "uppercase",
              textShadow: "0 2px 8px rgba(0,0,0,.35)",
            }}
          >
            Keith Muoki Presents
          </p>

          <h1
            style={{
              margin: "clamp(22px, 4vw, 42px) auto 0",
              maxWidth: 860,
              fontSize: "clamp(54px, 13vw, 154px)",
              lineHeight: 0.82,
              letterSpacing: "-0.075em",
              textTransform: "uppercase",
              textShadow: "0 8px 18px rgba(0,0,0,.42)",
            }}
          >
            Men’s
            <br />
            <span
              style={{
                display: "inline-block",
                color: "#f4c24e",
                WebkitTextStroke: "clamp(1px, .24vw, 3px) rgba(62, 19, 9, .56)",
                textShadow: "0 10px 18px rgba(0,0,0,.36)",
              }}
            >
              Conference
            </span>
          </h1>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr minmax(220px, 1.1fr) 1fr",
            gap: "clamp(12px, 3vw, 26px)",
            alignItems: "end",
            marginTop: "clamp(34px, 7vw, 80px)",
          }}
        >
          <InfoBlock label="Date" value="15th Aug 2026" align="left" />

          <div
            style={{
              minHeight: "clamp(230px, 34vw, 390px)",
              borderRadius: "38px 38px 0 0",
              background:
                "linear-gradient(180deg, rgba(255, 236, 190, .45), rgba(139, 55, 18, .68)), radial-gradient(circle at 50% 26%, #f7d99c 0 16%, #9a4e22 17% 25%, #4c2112 26% 100%)",
              border: "1px solid rgba(255, 230, 170, .34)",
              boxShadow: "0 34px 80px rgba(0,0,0,.38)",
              display: "grid",
              placeItems: "center",
              padding: 22,
            }}
          >
            <div
              style={{
                width: "min(260px, 72%)",
                aspectRatio: "1 / 1",
                borderRadius: "50%",
                background: "linear-gradient(145deg, #f2c68a, #6f2e1a)",
                boxShadow: "0 20px 60px rgba(0,0,0,.35)",
              }}
            />
          </div>

          <InfoBlock label="Seats" value="1500 Men" align="right" />
        </div>

        <footer
          style={{
            marginTop: "clamp(26px, 5vw, 56px)",
            display: "grid",
            gap: 14,
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#3a1608",
              fontSize: "clamp(18px, 3vw, 34px)",
              fontWeight: 950,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              textShadow: "0 1px 0 rgba(255,255,255,.18)",
            }}
          >
            Leadership • Purpose • Faith • Brotherhood
          </p>

          <p
            style={{
              justifySelf: "center",
              margin: 0,
              borderRadius: 999,
              padding: "12px 22px",
              background: "rgba(52, 14, 7, .86)",
              color: "#ffe4a7",
              fontWeight: 900,
              fontSize: "clamp(14px, 2.4vw, 22px)",
              boxShadow: "0 18px 48px rgba(0,0,0,.24)",
            }}
          >
            Book your ticket today
          </p>
        </footer>
      </div>
    </section>
  );
}

function InfoBlock({
  label,
  value,
  align,
}: {
  label: string;
  value: string;
  align: "left" | "right";
}) {
  return (
    <div
      style={{
        textAlign: align,
        color: "#3a1608",
        fontWeight: 950,
        textTransform: "uppercase",
        textShadow: "0 1px 0 rgba(255,255,255,.22)",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "clamp(12px, 1.8vw, 18px)",
          letterSpacing: "0.16em",
        }}
      >
        {label}
      </p>
      <strong
        style={{
          display: "block",
          marginTop: 6,
          fontSize: "clamp(25px, 4.6vw, 58px)",
          lineHeight: 0.92,
        }}
      >
        {value}
      </strong>
    </div>
  );
}
