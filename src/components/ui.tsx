import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function Button({ className = "", children, ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-md bg-gold px-4 py-2 text-sm font-semibold text-ink transition hover:bg-bronze disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

export function LinkButton({ className = "", children, href, ...props }: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex rounded-md bg-gold px-4 py-2 text-sm font-semibold text-ink transition hover:bg-bronze ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-white/10 bg-white/[0.04] p-5 ${className}`}>{children}</section>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm text-slate-300">
      <span>{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-md border border-white/10 bg-panel px-3 py-2 text-sm text-white outline-none ring-gold/40 focus:ring-2";
