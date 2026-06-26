import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { buildCalendlyUrl, getSchedulingOption } from "@/lib/scheduling";

export type CheckoutOrderInput = {
  eventSlug?: string;
  ticketTypeCode: string;
  quantity: number;
  buyerFullName: string;
  buyerEmail: string;
  buyerPhone: string;
  marketingOptIn?: boolean;
};

export async function createTicketOrder(input: CheckoutOrderInput) {
  const supabase = getSupabaseAdmin();
  const eventSlug = input.eventSlug || "men-conference-nairobi-2026";

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, name, slug")
    .eq("slug", eventSlug)
    .single();

  if (eventError || !event) {
    throw new Error("Event not found.");
  }

  const { data: ticketType, error: ticketTypeError } = await supabase
    .from("ticket_types")
    .select("id, code, name, price_kes, currency, delivery_mode, includes_zoom, requires_scheduling")
    .eq("event_id", event.id)
    .eq("code", input.ticketTypeCode)
    .eq("is_public", true)
    .single();

  if (ticketTypeError || !ticketType) {
    throw new Error("Ticket type not found.");
  }

  const quantity = Math.max(1, Math.min(20, Number(input.quantity || 1)));
  const amountKes = Number(ticketType.price_kes) * quantity;

  const { data: order, error: orderError } = await supabase
    .from("ticket_orders")
    .insert({
      event_id: event.id,
      buyer_full_name: input.buyerFullName,
      buyer_email: input.buyerEmail.toLowerCase(),
      buyer_phone: input.buyerPhone,
      status: "pending",
      amount_kes: amountKes,
      currency: "KES",
      payment_provider: "paystack",
      metadata: {
        ticket_type_code: input.ticketTypeCode,
        marketing_opt_in: Boolean(input.marketingOptIn),
      },
    })
    .select("*")
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message || "Unable to create order.");
  }

  const { error: itemError } = await supabase.from("ticket_order_items").insert({
    order_id: order.id,
    ticket_type_id: ticketType.id,
    quantity,
    unit_price_kes: ticketType.price_kes,
    total_price_kes: amountKes,
  });

  if (itemError) {
    throw new Error(itemError.message || "Unable to create order item.");
  }

  return { event, ticketType, order, quantity, amountKes };
}

export async function attachPaystackInitialization(params: {
  orderId: string;
  reference: string;
  accessCode: string;
  authorizationUrl: string;
  amountKobo: number;
  payload: unknown;
}) {
  const supabase = getSupabaseAdmin();

  const { data: order, error: updateError } = await supabase
    .from("ticket_orders")
    .update({
      status: "payment_initialized",
      payment_reference: params.reference,
      payment_access_code: params.accessCode,
      payment_authorization_url: params.authorizationUrl,
    })
    .eq("id", params.orderId)
    .select("*")
    .single();

  if (updateError || !order) {
    throw new Error(updateError?.message || "Unable to attach Paystack payment to order.");
  }

  await supabase.from("payment_logs").insert({
    order_id: params.orderId,
    provider: "paystack",
    reference: params.reference,
    event_type: "transaction.initialize",
    status: "initialized",
    amount: params.amountKobo,
    currency: "KES",
    payload: params.payload as object,
  });

  return order;
}

export async function finalizePaystackPayment(reference: string) {
  const supabase = getSupabaseAdmin();
  const transaction = await verifyPaystackTransaction(reference);

  const { data: order, error: orderError } = await supabase
    .from("ticket_orders")
    .select("*")
    .eq("payment_reference", reference)
    .single();

  if (orderError || !order) {
    throw new Error("Order not found for this payment reference.");
  }

  const expectedAmount = Number(order.amount_kes) * 100;
  const paid = transaction.status === "success";
  const amountMatches = Number(transaction.amount) === expectedAmount;
  const currencyMatches = transaction.currency === "KES";

  await supabase.from("payment_logs").insert({
    order_id: order.id,
    provider: "paystack",
    reference,
    event_type: "transaction.verify",
    status: transaction.status,
    amount: transaction.amount,
    currency: transaction.currency,
    payload: transaction as object,
  });

  if (!paid) {
    await supabase
      .from("ticket_orders")
      .update({ status: "failed", failure_reason: "Paystack transaction was not successful." })
      .eq("id", order.id);

    return {
      paid: false,
      order,
      transaction,
      tickets: [],
      requiresScheduling: false,
      message: "Payment was not successful.",
    };
  }

  if (!amountMatches || !currencyMatches) {
    await supabase
      .from("ticket_orders")
      .update({ status: "failed", failure_reason: "Payment amount or currency mismatch." })
      .eq("id", order.id);

    throw new Error("Payment verification failed because the amount or currency does not match the order.");
  }

  if (order.status !== "paid") {
    const { error: paidError } = await supabase
      .from("ticket_orders")
      .update({ status: "paid", paid_at: transaction.paid_at || new Date().toISOString() })
      .eq("id", order.id);

    if (paidError) {
      throw new Error(paidError.message || "Unable to mark order as paid.");
    }

    await supabase.rpc("issue_tickets_for_order", { p_order_id: order.id });
  }

  const { data: tickets, error: ticketsError } = await supabase
    .from("tickets")
    .select("*, ticket_types(name, code, delivery_mode, includes_zoom, requires_scheduling)")
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });

  if (ticketsError) {
    throw new Error(ticketsError.message || "Unable to fetch issued tickets.");
  }

  const requiresScheduling = Boolean(
    tickets?.some((ticket) => ticket.ticket_types?.requires_scheduling || ticket.ticket_types?.includes_zoom)
  );

  return {
    paid: true,
    order: { ...order, status: "paid" },
    transaction,
    tickets: tickets || [],
    requiresScheduling,
    message: "Payment confirmed.",
  };
}

export async function getTicketByCode(ticketCode: string) {
  const supabase = getSupabaseAdmin();

  const { data: ticket, error } = await supabase
    .from("tickets")
    .select("*, ticket_types(name, code, delivery_mode, includes_zoom, requires_scheduling), ticket_orders(id, status, buyer_full_name, buyer_email, buyer_phone, amount_kes, paid_at, metadata, events(name, event_date, venue, city))")
    .eq("ticket_code", ticketCode)
    .single();

  if (error || !ticket) {
    return null;
  }

  return ticket;
}

export async function getVirtualSchedulingAccess(ticketCode: string) {
  const ticket = await getTicketByCode(ticketCode);

  if (!ticket) {
    return { ok: false, message: "Ticket not found.", ticket: null, calendlyUrl: null };
  }

  if (ticket.ticket_types?.delivery_mode !== "virtual") {
    return { ok: false, message: "This ticket is not a virtual ticket.", ticket, calendlyUrl: null };
  }

  if (ticket.status !== "valid") {
    return { ok: false, message: `Ticket status is ${ticket.status}.`, ticket, calendlyUrl: null };
  }

  if (ticket.ticket_orders?.status !== "paid" && !ticket.ticket_orders?.paid_at) {
    return { ok: false, message: "Virtual access is available only after payment confirmation.", ticket, calendlyUrl: null };
  }

  const option = getSchedulingOption("virtual-ticket-zoom");
  const calendlyUrl = option
    ? buildCalendlyUrl(option.calendlyUrl, {
        ticketCode: ticket.ticket_code,
        orderId: ticket.ticket_orders?.id,
        buyerName: ticket.holder_name || ticket.ticket_orders?.buyer_full_name,
        buyerEmail: ticket.holder_email || ticket.ticket_orders?.buyer_email,
      })
    : null;

  return { ok: Boolean(calendlyUrl), message: calendlyUrl ? "Virtual access ready." : "Calendly URL is not configured.", ticket, calendlyUrl };
}

export async function prepareTicketDelivery(ticketCode: string) {
  const ticket = await getTicketByCode(ticketCode);

  if (!ticket) {
    return null;
  }

  const isVirtual = ticket.ticket_types?.delivery_mode === "virtual";
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

  return {
    providerConnected: false,
    ticketCode: ticket.ticket_code,
    recipientName: ticket.holder_name,
    recipientEmail: ticket.holder_email,
    ticketUrl: `${baseUrl}/ticket/${encodeURIComponent(ticket.ticket_code)}`,
    pdfUrl: `${baseUrl}/api/tickets/${encodeURIComponent(ticket.ticket_code)}/pdf`,
    message: isVirtual
      ? "Delivery provider is not connected. Share the ticket URL and virtual access page with the buyer."
      : "Delivery provider is not connected. Share the ticket URL or PDF with the buyer.",
    virtualAccessUrl: isVirtual ? `${baseUrl}/schedule?ticketCode=${encodeURIComponent(ticket.ticket_code)}` : null,
  };
}

export async function checkInPhysicalTicketByCode(ticketCode: string) {
  const supabase = getSupabaseAdmin();
  const ticket = await getTicketByCode(ticketCode);

  if (!ticket) {
    await logCheckInAttempt(ticketCode, "not_found", "Ticket not found.");
    return { ok: false, message: "Ticket not found." };
  }

  if (ticket.ticket_types?.delivery_mode === "virtual") {
    await logCheckInAttempt(ticketCode, "blocked", "Virtual ticket gate check-in blocked.", ticket.id);
    return { ok: false, message: "Virtual tickets cannot be checked in at the gate." };
  }

  if (ticket.status === "checked_in") {
    await logCheckInAttempt(ticketCode, "already_checked_in", "Ticket is already checked in.", ticket.id);
    return { ok: false, message: "Ticket is already checked in." };
  }

  if (ticket.status !== "valid") {
    await logCheckInAttempt(ticketCode, "invalid_status", `Ticket status is ${ticket.status}.`, ticket.id);
    return { ok: false, message: `Ticket status is ${ticket.status}.` };
  }

  const { error } = await supabase
    .from("tickets")
    .update({ status: "checked_in", checked_in: true, checked_in_at: new Date().toISOString() })
    .eq("id", ticket.id)
    .eq("status", "valid");

  if (error) {
    await logCheckInAttempt(ticketCode, "error", error.message || "Unable to check in ticket.", ticket.id);
    throw new Error(error.message || "Unable to check in ticket.");
  }

  await logCheckInAttempt(ticketCode, "checked_in", "Ticket checked in.", ticket.id);
  return { ok: true, message: "Ticket checked in." };
}

async function logCheckInAttempt(ticketCode: string, result: string, detail: string, ticketId?: string) {
  const supabase = getSupabaseAdmin();

  await supabase.from("checkin_logs").insert({
    ticket_id: ticketId || null,
    ticket_code: ticketCode,
    result,
    actor_label: "admin_key",
    detail,
  });
}
