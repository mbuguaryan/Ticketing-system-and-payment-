import Image from "next/image";
import { CalendarDays, MapPin, ShieldCheck } from "lucide-react";
import { LinkButton, Panel } from "@/components/ui";

export default function ConferencePage() {
  return (
    <main>
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white md:text-6xl">
            2026 Men Conference Nairobi
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            A focused men&apos;s gathering hosted by Keith Muoki at KICC Nairobi. Buy a physical ticket for KICC or a
            virtual ticket for online access, then receive a secure QR ticket after Paystack payment confirmation.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/checkout">Book Now</LinkButton>
            <LinkButton href="/verify-ticket" className="bg-white/10 text-white hover:bg-white/15">Verify ticket</LinkButton>
          </div>
        </div>
        <div className="space-y-5">
          <Image
            src="/mens-conference-poster.jpeg"
            alt="Men's Conference 2026 poster"
            width={900}
            height={1200}
            priority
            className="w-full rounded-lg border border-white/10 object-cover shadow-2xl"
          />
          <Panel className="space-y-5">
            <div className="flex items-center gap-3 text-slate-200">
              <CalendarDays className="h-5 w-5 text-gold" />
              <span>Saturday 15 August 2026, gates open 12PM EAT</span>
            </div>
            <div className="flex items-center gap-3 text-slate-200">
              <MapPin className="h-5 w-5 text-gold" />
              <span>KICC Nairobi, Kenya</span>
            </div>
            <div className="flex items-center gap-3 text-slate-200">
              <ShieldCheck className="h-5 w-5 text-gold" />
              <span>QR tickets generated only after verified Paystack payment</span>
            </div>
          </Panel>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-12 md:grid-cols-3">
          {[
            ["Early Bird", "KES 2,500", "Physical KICC access"],
            ["2 Men", "KES 4,500", "Physical KICC access"],
            ["5 Men", "KES 10,000", "Physical KICC access"],
            ["Virtual Ticket", "KES 2,500", "Zoom/online access for outside Kenya"]
          ].map(([name, price, note]) => (
            <Panel key={name}>
              <h2 className="text-xl font-semibold">{name}</h2>
              <p className="mt-3 text-3xl font-bold text-gold">{price}</p>
              <p className="mt-2 text-sm text-slate-300">{note}</p>
            </Panel>
          ))}
        </div>
      </section>
    </main>
  );
}
