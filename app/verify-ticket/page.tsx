export default async function VerifyTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const params = await searchParams;
  const code = params.code;

  return (
    <main style={{ minHeight: "100vh", padding: 32, background: "#080808", color: "#f7f2e8", fontFamily: "Arial, sans-serif" }}>
      <section style={{ maxWidth: 760, margin: "0 auto", paddingTop: 80 }}>
        <p style={{ color: "#d6a84f", fontWeight: 700 }}>Gate Verification</p>
        <h1 style={{ fontSize: "clamp(36px, 7vw, 72px)", lineHeight: 0.95 }}>Verify Ticket</h1>
        {code ? (
          <div style={{ border: "1px solid #2f2617", borderRadius: 24, padding: 24, background: "#15120d" }}>
            <p style={{ color: "#b8ac97" }}>Scanned ticket code:</p>
            <strong style={{ wordBreak: "break-all" }}>{code}</strong>
            <p style={{ color: "#b8ac97", lineHeight: 1.6 }}>
              Database validation and one-time check-in will be connected in the Supabase phase.
            </p>
          </div>
        ) : (
          <form style={{ display: "grid", gap: 14, border: "1px solid #2f2617", borderRadius: 24, padding: 24, background: "#15120d" }}>
            <label style={{ display: "grid", gap: 8 }}>
              Ticket Code
              <input name="code" placeholder="Paste or scan ticket code" style={{ border: "1px solid #2f2617", borderRadius: 14, padding: "14px 16px", background: "#0f0d09", color: "#f7f2e8", fontSize: 16 }} />
            </label>
            <button type="submit" style={{ border: 0, borderRadius: 999, padding: "15px 22px", background: "#d6a84f", color: "#120d04", fontWeight: 800, cursor: "pointer" }}>
              Verify
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
