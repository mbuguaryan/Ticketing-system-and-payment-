import { createServiceClient } from "@/lib/supabase/server";
import { Panel } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = createServiceClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, buyer_name, status, total_amount, currency, created_at")
    .order("created_at", { ascending: false })
    .limit(10);
  const { data: tickets } = await supabase
    .from("tickets")
    .select("id, checked_in, ticket_types(delivery_mode)")
    .limit(1000);

  const totalOrders = orders?.length ?? 0;
  const paidOrders = orders?.filter((order) => order.status === "paid").length ?? 0;
  const pendingOrders = orders?.filter((order) => ["pending", "awaiting_payment"].includes(order.status)).length ?? 0;
  const revenue = orders?.filter((order) => order.status === "paid").reduce((sum, order) => sum + Number(order.total_amount), 0) ?? 0;
  const physicalTickets = tickets?.filter((ticket) => {
    const ticketType = Array.isArray(ticket.ticket_types) ? ticket.ticket_types[0] : ticket.ticket_types;
    return ticketType?.delivery_mode !== "virtual";
  }).length ?? 0;
  const virtualTickets = tickets?.filter((ticket) => {
    const ticketType = Array.isArray(ticket.ticket_types) ? ticket.ticket_types[0] : ticket.ticket_types;
    return ticketType?.delivery_mode === "virtual";
  }).length ?? 0;

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold">Admin dashboard</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          ["Total orders", totalOrders],
          ["Paid orders", paidOrders],
          ["Pending orders", pendingOrders],
          ["Revenue", `KES ${revenue.toLocaleString()}`],
          ["Physical tickets", physicalTickets],
          ["Virtual tickets", virtualTickets]
        ].map(([label, value]) => (
          <Panel key={label}>
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-bold text-gold">{value}</p>
          </Panel>
        ))}
      </div>
      <Panel className="mt-8">
        <h2 className="text-xl font-semibold">Recent orders</h2>
        <div className="mt-4 grid gap-3 text-sm">
          {(orders ?? []).map((order) => (
            <div key={order.id} className="flex flex-wrap justify-between gap-3 border-b border-white/10 pb-3">
              <span>{order.buyer_name}</span>
              <span className="capitalize text-slate-300">{order.status.replace("_", " ")}</span>
              <span className="text-gold">{order.currency} {Number(order.total_amount).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </Panel>
    </main>
  );
}
