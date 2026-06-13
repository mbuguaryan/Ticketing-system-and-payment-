import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "2026 Men Conference Nairobi",
  description: "Ticketing and PesaLink payment system for the 2026 Men Conference Nairobi."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink text-slate-50 antialiased">
        <header className="border-b border-white/10 bg-ink/95">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/conference/men-conference-2026" className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">
              Kujua Point
            </Link>
            <nav className="flex items-center gap-4 text-sm text-slate-300">
              <Link href="/checkout" className="hover:text-white">Checkout</Link>
              <Link href="/admin/manual-confirmation" className="hover:text-white">Admin</Link>
              <Link href="/admin/checkin" className="hover:text-white">Gate</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
