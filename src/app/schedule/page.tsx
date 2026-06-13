import { LinkButton, Panel } from "@/components/ui";

export default function SchedulePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Virtual access and support</h1>
      <Panel className="mt-8 space-y-4">
        <p className="text-slate-300">
          Zoom access details are shared only after a verified virtual ticket payment. Open your paid virtual ticket to
          access the Calendly scheduling link.
        </p>
        <p className="text-sm text-slate-400">Support: 0750 886 617</p>
        <LinkButton href="/checkout">Book virtual ticket</LinkButton>
      </Panel>
    </main>
  );
}

