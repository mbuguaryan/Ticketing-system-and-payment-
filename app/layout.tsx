import type { Metadata } from "next";

const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appBaseUrl),
  title: "Men Conference Nairobi 2026 Tickets",
  description: "Official ticketing system for Men Conference Nairobi 2026.",
  alternates: {
    canonical: "/conference/men-conference-2026",
  },
  openGraph: {
    title: "Men Conference Nairobi 2026 Tickets",
    description: "Book physical KICC tickets or virtual Zoom access for Men Conference Nairobi 2026.",
    url: "/conference/men-conference-2026",
    siteName: "Men Conference Nairobi 2026",
    images: ["/mens-conference-poster.jpeg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Men Conference Nairobi 2026 Tickets",
    description: "Book physical KICC tickets or virtual Zoom access for Men Conference Nairobi 2026.",
    images: ["/mens-conference-poster.jpeg"],
  },
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
