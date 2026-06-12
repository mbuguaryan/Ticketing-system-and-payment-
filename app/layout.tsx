import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Men Conference Nairobi 2026 Tickets",
  description: "Official ticketing system for Men Conference Nairobi 2026.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ background: "#050302" }}>
      <body
        style={{
          margin: 0,
          background: "#050302",
          minHeight: "100vh",
          overflowX: "hidden",
        }}
      >
        {children}
      </body>
    </html>
  );
}
