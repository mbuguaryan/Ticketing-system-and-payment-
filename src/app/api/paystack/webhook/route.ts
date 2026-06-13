import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { finalizePaystackPayment } from "@/lib/paystack";
import { createServiceClient } from "@/lib/supabase/server";

function isValidSignature(rawBody: string, signature: string | null) {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(signature, "hex");
  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!isValidSignature(rawBody, request.headers.get("x-paystack-signature"))) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    event?: string;
    data?: { id?: number | string; reference?: string };
  };
  const supabase = createServiceClient();
  const eventId = String(event.data?.id ?? event.data?.reference ?? randomUUID());

  await supabase.from("webhook_events").upsert(
    {
      provider: "paystack",
      event_id: eventId,
      event_type: event.event ?? "unknown",
      provider_reference: event.data?.reference ?? null,
      raw_payload: event,
      processed_at: null
    },
    { onConflict: "provider,event_id", ignoreDuplicates: true }
  );

  if (event.event === "charge.success" && event.data?.reference) {
    await finalizePaystackPayment(event.data.reference);
    await supabase
      .from("webhook_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("provider", "paystack")
      .eq("event_id", eventId);
  }

  return NextResponse.json({ received: true });
}
