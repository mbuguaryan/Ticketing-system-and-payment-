import { createQrDataUrl, createTicketVerificationUrl } from "@/lib/tickets/qr";
import { createRawTicketToken, createTicketCode, hashTicketToken } from "@/lib/tickets/ticket-codes";
import { createServiceClient } from "@/lib/supabase/server";

type PaystackInitializeResponse = {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data?: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    paid_at?: string;
    metadata?: Record<string, unknown>;
  };
};

function paystackSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("Missing PAYSTACK_SECRET_KEY");
  return key;
}

export async function initializePaystackTransaction(input: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}) {
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${paystackSecretKey()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      currency: "KES",
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata
    })
  });

  const body = (await response.json()) as PaystackInitializeResponse;
  if (!response.ok || !body.status || !body.data?.authorization_url) {
    throw new Error(body.message || "Paystack initialization failed.");
  }

  return body.data;
}

export async function verifyPaystackTransaction(reference: string) {
  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${paystackSecretKey()}` },
    cache: "no-store"
  });
  const body = (await response.json()) as PaystackVerifyResponse;
  if (!response.ok || !body.status || !body.data) {
    throw new Error(body.message || "Paystack verification failed.");
  }
  return body.data;
}

export async function issueTicketsForOrder(orderId: string) {
  const supabase = createServiceClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, event_id, buyer_name, buyer_phone, buyer_email, status")
    .eq("id", orderId)
    .single();

  if (orderError || !order) throw new Error("Order not found.");
  if (order.status !== "paid") throw new Error("Cannot issue tickets for an unpaid order.");

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("ticket_type_id, quantity")
    .eq("order_id", order.id);

  if (itemsError || !items?.length) throw new Error("Order has no ticket items.");

  const existingByType = new Map<string, number>();
  const { data: existingTickets } = await supabase
    .from("tickets")
    .select("ticket_type_id")
    .eq("order_id", order.id);

  for (const ticket of existingTickets ?? []) {
    const key = ticket.ticket_type_id ?? "";
    existingByType.set(key, (existingByType.get(key) ?? 0) + 1);
  }

  const { count } = await supabase.from("tickets").select("id", { count: "exact", head: true });
  let sequence = (count ?? 0) + 1;
  const ticketsToInsert = [];

  for (const item of items) {
    const current = existingByType.get(item.ticket_type_id) ?? 0;
    const missing = Math.max(0, Number(item.quantity) - current);
    for (let index = 0; index < missing; index += 1) {
      const ticketCode = createTicketCode(sequence);
      const rawToken = createRawTicketToken();
      const verificationUrl = createTicketVerificationUrl(ticketCode, rawToken);
      ticketsToInsert.push({
        event_id: order.event_id,
        order_id: order.id,
        ticket_type_id: item.ticket_type_id,
        ticket_code: ticketCode,
        secure_token_hash: hashTicketToken(rawToken),
        attendee_name: order.buyer_name,
        attendee_phone: order.buyer_phone,
        attendee_email: order.buyer_email,
        qr_code_url: await createQrDataUrl(verificationUrl),
        status: "active"
      });
      sequence += 1;
    }
  }

  if (ticketsToInsert.length > 0) {
    const { error: ticketError } = await supabase.from("tickets").insert(ticketsToInsert);
    if (ticketError) throw new Error("Could not generate tickets.");
  }

  const { data: tickets } = await supabase
    .from("tickets")
    .select("ticket_code, attendee_name, qr_code_url, status")
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });

  return tickets ?? [];
}

export async function finalizePaystackPayment(reference: string) {
  const supabase = createServiceClient();
  const transaction = await verifyPaystackTransaction(reference);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, total_amount, currency, status")
    .eq("payment_reference", reference)
    .single();

  if (orderError || !order) throw new Error("Order not found for payment reference.");
  if (transaction.status !== "success") throw new Error("Payment was not successful.");
  if (transaction.currency !== order.currency) throw new Error("Payment currency mismatch.");
  if (Number(transaction.amount) !== Number(order.total_amount) * 100) throw new Error("Payment amount mismatch.");

  if (order.status !== "paid") {
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        provider_reference: transaction.reference,
        paid_at: transaction.paid_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", order.id);
    if (updateError) throw new Error("Could not mark order paid.");
  }

  await supabase.from("payment_logs").insert({
    order_id: order.id,
    provider: "paystack",
    event_type: "transaction.verify",
    provider_reference: transaction.reference,
    amount: Number(transaction.amount) / 100,
    currency: transaction.currency,
    status: transaction.status,
    raw_payload: transaction
  });

  const tickets = await issueTicketsForOrder(order.id);
  return { orderId: order.id, tickets };
}
