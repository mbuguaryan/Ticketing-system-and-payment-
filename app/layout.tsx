import type { Metadata } from "next";
import Script from "next/script";

const META_PIXEL_ID = "1303991068337809";
const META_TEST_EVENT_CODE = "TEST36802";

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

        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView', {
              test_event_code: '${META_TEST_EVENT_CODE}'
            });
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      </body>
    </html>
  );
}
