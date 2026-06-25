import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { formatKes } from "@/lib/ticket-types";

const EVENT_SLUGS = ["men-conference-nairobi-2026", "men-conference-2026"];
const SESSION_COOKIE = "admin_dashboard_session";

type AdminPageProps = {
  searchParams: Promise<{ error?: string }>;
};

type TicketTypeRow = {
  id: string;
  code: string;
  name: string;
  price_kes: number;
  delivery_mode: string;
};

type OrderItemRow = {
  quantity: number;
  total_price_kes: number;
  ticket_type_id: string;
  ticket_types?: TicketTypeRow | TicketTypeRow[] | null;
};

type OrderRow = {
  id: string;
  buyer_full_name: string;
  buyer_email: string;
  status: string;
  amount_kes: number;
  created_at: string;
};

type TicketRow = {
  id: string;
  ticket_code: string;
  holder_name: string;
  status: string;
  created_at: string;
  ticket_types?: { name?: string; delivery_mode?: string } | null;
};

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const adminKey = process.env.ADMIN_CONFIRMATION_KEY;

  if (!adminKey) {
    return (
      <AdminShell>
        <section style={panelStyle}>
          <p style={eyebrowStyle}>Admin Dashboard</p>
          <h1 style={titleStyle}>Admin password is not configured</h1>
          <p style={bodyStyle}>
            Add a strong value for ADMIN_CONFIRMATION_KEY in .env.local, then restart the dev server.
          </p>
        </section>
      </AdminShell>
    );
  }

  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;
  const isUnlocked = Boolean(session && safeCompare(session, signAdminSession(adminKey)));

  if (!isUnlocked) {
    return (
      <AdminShell>
        <section style={panelStyle}>
          <p style={eyebrowStyle}>Admin Dashboard</p>
          <h1 style={titleStyle}>Enter Admin Password</h1>
          <p style={bodyStyle}>Use the configured ADMIN_CONFIRMATION_KEY to view live ticket sales.</p>
          {params.error === "invalid" ? (
            <p style={{ color: "#ffb4a6", fontWeight: 800 }}>Incorrect admin password.</p>
          ) : null}
          <form action={unlockAdminDashboard} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
            <input
              name="password"
              type="password"
              placeholder="Admin password"
              required
              style={inputStyle}
            />
            <button type="submit" style={primaryButtonStyle}>
              Unlock dashboard
            </button>
          </form>
        </section>
      </AdminShell>
    );
  }

  const dashboard = await getAdminDashboardData();

  return (
    <AdminShell>
      <section>
        <p style={eyebrowStyle}>Admin Dashboard</p>
        <h1 style={titleStyle}>Ticketing Operations</h1>
        <p style={bodyStyle}>Live paid-ticket totals from Supabase.</p>

        <div style={summaryGridStyle}>
          <MetricCard label="Tickets Sold" value={String(dashboard.totalSold)} />
          <MetricCard label="Physical Sold" value={String(dashboard.physicalSold)} />
          <MetricCard label="Virtual Sold" value={String(dashboard.virtualSold)} />
          <MetricCard label="Paid Revenue" value={formatKes(dashboard.revenueKes)} />
          <MetricCard label="Total Orders" value={String(dashboard.totalOrders)} />
          <MetricCard label="Pending Orders" value={String(dashboard.pendingOrders)} />
          <MetricCard label="Failed Orders" value={String(dashboard.failedOrders)} />
          <MetricCard label="Recent Check-ins" value={String(dashboard.recentCheckIns)} />
        </div>

        <div style={tableWrapStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <TableHead>Ticket Type</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Sold</TableHead>
                <TableHead>Revenue</TableHead>
              </tr>
            </thead>
            <tbody>
              {dashboard.ticketTypes.map((ticketType) => (
                <tr key={ticketType.id}>
                  <TableCell>
                    <strong>{ticketType.name}</strong>
                    <div style={{ color: "#8f8068", fontSize: 13 }}>{ticketType.code}</div>
                  </TableCell>
                  <TableCell>{ticketType.deliveryMode}</TableCell>
                  <TableCell>{ticketType.sold}</TableCell>
                  <TableCell>{formatKes(ticketType.revenueKes)}</TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Link href="/conference/men-conference-2026" style={secondaryButtonStyle}>
          View public ticket page
        </Link>
        <a href="/admin/export-attendees" style={secondaryButtonStyle}>
          Export attendees
        </a>

        <div style={twoColumnGridStyle}>
          <section>
            <h2>Recent Orders</h2>
            <div style={tableWrapStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <TableCell>
                        <strong>{order.buyer_full_name}</strong>
                        <div style={{ color: "#8f8068", fontSize: 13 }}>{order.buyer_email}</div>
                      </TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell>{formatKes(Number(order.amount_kes || 0))}</TableCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2>Recent Tickets</h2>
            <div style={tableWrapStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recentTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <TableCell>
                        <strong>{ticket.holder_name}</strong>
                        <div style={{ color: "#8f8068", fontSize: 13 }}>{ticket.ticket_code}</div>
                      </TableCell>
                      <TableCell>{ticket.ticket_types?.name || "Ticket"}</TableCell>
                      <TableCell>{ticket.status}</TableCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </AdminShell>
  );
}

async function unlockAdminDashboard(formData: FormData) {
  "use server";

  const adminKey = process.env.ADMIN_CONFIRMATION_KEY;
  const password = String(formData.get("password") || "");

  if (!adminKey || !safeCompare(password, adminKey)) {
    redirect("/admin?error=invalid");
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, signAdminSession(adminKey), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/admin",
  });

  redirect("/admin");
}

async function getAdminDashboardData() {
  const supabase = getSupabaseAdmin();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, slug")
    .in("slug", EVENT_SLUGS)
    .limit(1)
    .single();

  if (eventError || !event) {
    throw new Error("Event not found in Supabase.");
  }

  const { data: ticketTypes, error: ticketTypesError } = await supabase
    .from("ticket_types")
    .select("id, code, name, price_kes, delivery_mode")
    .eq("event_id", event.id)
    .order("sort_order", { ascending: true });

  if (ticketTypesError) {
    throw new Error(ticketTypesError.message);
  }

  const { data: orderItems, error: orderItemsError } = await supabase
    .from("ticket_order_items")
    .select(
      "quantity, total_price_kes, ticket_type_id, ticket_types(id, code, name, price_kes, delivery_mode), ticket_orders!inner(status, event_id)"
    )
    .eq("ticket_orders.status", "paid")
    .eq("ticket_orders.event_id", event.id);

  if (orderItemsError) {
    throw new Error(orderItemsError.message);
  }

  const { data: orders, error: ordersError } = await supabase
    .from("ticket_orders")
    .select("id, buyer_full_name, buyer_email, status, amount_kes, created_at")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false });

  if (ordersError) {
    throw new Error(ordersError.message);
  }

  const { data: recentTickets, error: recentTicketsError } = await supabase
    .from("tickets")
    .select("id, ticket_code, holder_name, status, created_at, ticket_types(name, delivery_mode)")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false })
    .limit(8);

  if (recentTicketsError) {
    throw new Error(recentTicketsError.message);
  }

  const { count: recentCheckIns, error: checkInsError } = await supabase
    .from("checkin_logs")
    .select("id", { count: "exact", head: true })
    .eq("result", "checked_in");

  if (checkInsError) {
    throw new Error(checkInsError.message);
  }

  const totalsByType = new Map<string, { sold: number; revenueKes: number }>();

  for (const item of (orderItems || []) as OrderItemRow[]) {
    const current = totalsByType.get(item.ticket_type_id) || { sold: 0, revenueKes: 0 };
    current.sold += Number(item.quantity || 0);
    current.revenueKes += Number(item.total_price_kes || 0);
    totalsByType.set(item.ticket_type_id, current);
  }

  const rows = ((ticketTypes || []) as TicketTypeRow[]).map((ticketType) => {
    const totals = totalsByType.get(ticketType.id) || { sold: 0, revenueKes: 0 };

    return {
      id: ticketType.id,
      code: ticketType.code,
      name: ticketType.name,
      deliveryMode: ticketType.delivery_mode,
      sold: totals.sold,
      revenueKes: totals.revenueKes,
    };
  });

  return {
    ticketTypes: rows,
    totalSold: rows.reduce((sum, row) => sum + row.sold, 0),
    physicalSold: rows.filter((row) => row.deliveryMode === "physical").reduce((sum, row) => sum + row.sold, 0),
    virtualSold: rows.filter((row) => row.deliveryMode === "virtual").reduce((sum, row) => sum + row.sold, 0),
    revenueKes: rows.reduce((sum, row) => sum + row.revenueKes, 0),
    totalOrders: (orders || []).length,
    pendingOrders: (orders || []).filter((order) => order.status === "pending" || order.status === "payment_initialized").length,
    failedOrders: (orders || []).filter((order) => order.status === "failed").length,
    recentOrders: ((orders || []) as OrderRow[]).slice(0, 8),
    recentTickets: (recentTickets || []) as TicketRow[],
    recentCheckIns: recentCheckIns || 0,
  };
}

function signAdminSession(adminKey: string) {
  return createHmac("sha256", adminKey).update("admin-dashboard").digest("hex");
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <main style={mainStyle}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>{children}</div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={cardStyle}>
      <p style={{ margin: 0, color: "#b8ac97", fontSize: 14 }}>{label}</p>
      <strong style={{ display: "block", marginTop: 8, fontSize: 32 }}>{value}</strong>
    </div>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return <th style={tableHeadStyle}>{children}</th>;
}

function TableCell({ children }: { children: React.ReactNode }) {
  return <td style={tableCellStyle}>{children}</td>;
}

const mainStyle = {
  minHeight: "100vh",
  padding: 32,
  background: "#080808",
  color: "#f7f2e8",
  fontFamily: "Arial, sans-serif",
} as const;

const panelStyle = {
  border: "1px solid #2f2617",
  borderRadius: 24,
  padding: 28,
  background: "#15120d",
} as const;

const eyebrowStyle = {
  color: "#d6a84f",
  fontWeight: 700,
  margin: 0,
} as const;

const titleStyle = {
  fontSize: "clamp(38px, 7vw, 74px)",
  lineHeight: 0.95,
  margin: "12px 0",
} as const;

const bodyStyle = {
  color: "#b8ac97",
  fontSize: 18,
  lineHeight: 1.6,
  maxWidth: 760,
} as const;

const inputStyle = {
  width: "100%",
  border: "1px solid #3a2b14",
  borderRadius: 14,
  padding: "14px 16px",
  background: "#090706",
  color: "#f7f2e8",
  fontSize: 16,
} as const;

const primaryButtonStyle = {
  border: 0,
  borderRadius: 999,
  padding: "14px 22px",
  background: "#d6a84f",
  color: "#120d04",
  fontWeight: 900,
  cursor: "pointer",
} as const;

const secondaryButtonStyle = {
  display: "inline-flex",
  marginTop: 28,
  border: "1px solid #3a2b14",
  borderRadius: 999,
  padding: "14px 22px",
  color: "#f7f2e8",
  fontWeight: 900,
  textDecoration: "none",
} as const;

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
  gap: 16,
  marginTop: 28,
} as const;

const twoColumnGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: 18,
  marginTop: 28,
} as const;

const cardStyle = {
  border: "1px solid #2f2617",
  borderRadius: 18,
  padding: 20,
  background: "#15120d",
} as const;

const tableWrapStyle = {
  overflowX: "auto",
  border: "1px solid #2f2617",
  borderRadius: 18,
  marginTop: 18,
  background: "#15120d",
} as const;

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
} as const;

const tableHeadStyle = {
  padding: 16,
  textAlign: "left",
  color: "#d6a84f",
  borderBottom: "1px solid #2f2617",
} as const;

const tableCellStyle = {
  padding: 16,
  borderBottom: "1px solid #2f2617",
  color: "#f7f2e8",
} as const;
