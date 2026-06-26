import crypto, { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { extractZoomJoinUrl } from "@/lib/scheduling";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type CalendlyWebhookPayload = {
  event?: string;
  payload?: {
    uri?: string;
    email?: string;
    name?: string;
    event?: string;
    tracking?: Record<string, unknown>;
    questions_and_answers?: Array<{ question?: string; answer?: string }>;
    scheduled_event?: {
      uri?: string;
      start_time?: string;
      end_time?: string;
      location?: unknown;
    };
  };
};

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature =
    request.headers.get("x-calendly-webhook-signature") ||
    request.headers.get("x-calendly-signature");

  if (!verifyCalendlySignature(rawBody, signature)) {
    return NextResponse.json({ ok: false, message: "Invalid Calendly webhook signature." }, { status: 401 });
  }

  const body = JSON.parse(rawBody) as CalendlyWebhookPayload;
  const payload = body.payload || {};
  const eventType = body.event || "unknown";
  const inviteeUri = payload.uri || null;
  const scheduledEventUri = payload.scheduled_event?.uri || payload.event || null;
  const eventId = inviteeUri || `${eventType}:${scheduledEventUri || crypto.createHash("sha256").update(rawBody).digest("hex")}`;
  const context = extractTicketContext(body);
  const supabase = getSupabaseAdmin();

  await supabase.from("webhook_events").upsert(
    {
      provider: "calendly",
      event_id: eventId,
      event_type: eventType,
      provider_reference: inviteeUri || scheduledEventUri,
      raw_payload: body as object,
      processed_at: new Date().toISOString(),
    },
    { onConflict: "provider,event_id" }
  );

  const matched = await findMatchedTicketOrOrder(context);
  const location = payload.scheduled_event?.location || {};
  const zoomJoinUrl = extractZoomJoinUrl(location);
  const status = eventType.includes("canceled") ? "cancelled" : "scheduled";

  await supabase.from("calendly_schedules").upsert(
    {
      order_id: matched.orderId,
      ticket_id: matched.ticketId,
      ticket_code: matched.ticketCode || context.ticketCode || null,
      invitee_uri: inviteeUri,
      invitee_email: payload.email || context.buyerEmail || null,
      invitee_name: payload.name || context.buyerName || null,
      event_uri: payload.event || null,
      scheduled_event_uri: scheduledEventUri,
      scheduled_start_time: payload.scheduled_event?.start_time || null,
      scheduled_end_time: payload.scheduled_event?.end_time || null,
      location: (location || {}) as object,
      zoom_join_url: zoomJoinUrl,
      status,
      raw_payload: body as object,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "invitee_uri" }
  );

  if (matched.orderId) {
    await supabase
      .from("ticket_orders")
      .update({
        metadata: {
          ...(matched.orderMetadata || {}),
          calendly: {
            invitee_uri: inviteeUri,
            invitee_email: payload.email || null,
            invitee_name: payload.name || null,
            event_uri: payload.event || null,
            scheduled_event_uri: scheduledEventUri,
            scheduled_start_time: payload.scheduled_event?.start_time || null,
            scheduled_end_time: payload.scheduled_event?.end_time || null,
            zoom_join_url: zoomJoinUrl,
            status,
          },
        },
      })
      .eq("id", matched.orderId);
  }

  return NextResponse.json({
    ok: true,
    received: true,
    event: eventType,
    matched: Boolean(matched.orderId || matched.ticketId),
  });
}

function verifyCalendlySignature(rawBody: string, signatureHeader: string | null) {
  const signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;

  if (!signingKey || !signatureHeader) {
    return false;
  }

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key?.trim(), value?.trim()];
    })
  );
  const timestamp = parts.t;
  const received = parts.v1 || signatureHeader.trim();
  const signedPayload = timestamp ? `${timestamp}.${rawBody}` : rawBody;
  const expected = crypto.createHmac("sha256", signingKey).update(signedPayload).digest("hex");
  const fallbackExpected = crypto.createHmac("sha256", signingKey).update(rawBody).digest("hex");

  return safeCompare(received, expected) || safeCompare(received, fallbackExpected);
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function extractTicketContext(body: CalendlyWebhookPayload) {
  const payload = body.payload || {};
  const tracking = payload.tracking || {};
  const answers = payload.questions_and_answers || [];
  const answerText = answers.map((item) => `${item.question || ""} ${item.answer || ""}`).join(" ");
  const combined = `${tracking.utm_content || ""} ${tracking.utm_term || ""} ${answerText}`;

  return {
    ticketCode: findPattern(combined, /MNC2026-[A-F0-9]+/i),
    orderId: findPattern(combined, /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i),
    buyerEmail: payload.email || stringValue(tracking.utm_campaign),
    buyerName: payload.name,
  };
}

function findPattern(value: string, pattern: RegExp) {
  return value.match(pattern)?.[0] || null;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : null;
}

async function findMatchedTicketOrOrder(context: ReturnType<typeof extractTicketContext>) {
  const supabase = getSupabaseAdmin();

  if (context.ticketCode) {
    const { data: ticket } = await supabase
      .from("tickets")
      .select("id, ticket_code, order_id, ticket_orders(metadata)")
      .eq("ticket_code", context.ticketCode)
      .maybeSingle();

    if (ticket) {
      const orderRelation = Array.isArray(ticket.ticket_orders) ? ticket.ticket_orders[0] : ticket.ticket_orders;

      return {
        ticketId: ticket.id,
        ticketCode: ticket.ticket_code,
        orderId: ticket.order_id,
        orderMetadata: orderRelation?.metadata || {},
      };
    }
  }

  if (context.orderId) {
    const { data: order } = await supabase
      .from("ticket_orders")
      .select("id, metadata")
      .eq("id", context.orderId)
      .maybeSingle();

    if (order) {
      return { ticketId: null, ticketCode: context.ticketCode, orderId: order.id, orderMetadata: order.metadata || {} };
    }
  }

  if (context.buyerEmail) {
    const { data: order } = await supabase
      .from("ticket_orders")
      .select("id, metadata")
      .eq("buyer_email", context.buyerEmail.toLowerCase())
      .eq("status", "paid")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (order) {
      return { ticketId: null, ticketCode: context.ticketCode, orderId: order.id, orderMetadata: order.metadata || {} };
    }
  }

  return { ticketId: null, ticketCode: context.ticketCode, orderId: null, orderMetadata: {} };
}
