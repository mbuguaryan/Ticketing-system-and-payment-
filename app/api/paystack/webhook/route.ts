import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { finalizePaystackPayment } from "@/lib/ticketing";

function verifySignature(rawBody: string, signature: string | null) {
  const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return false;
  }

  const hash = crypto.createHmac("sha512", webhookSecret).update(rawBody).digest("hex");
  return hash === signature;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ ok: false, message: "Invalid webhook signature." }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    event?: string;
    data?: {
      reference?: string;
      status?: string;
      amount?: number;
      currency?: string;
      metadata?: Record<string, unknown>;
    };
  };

  if (event.event === "charge.success" && event.data?.status === "success") {
    if (!event.data.reference) {
      return NextResponse.json({ ok: false, message: "Payment reference is required." }, { status: 400 });
    }

    const result = await finalizePaystackPayment(event.data.reference);

    return NextResponse.json({
      ok: true,
      handled: true,
      reference: event.data.reference,
      paid: result.paid,
      ticketsIssued: result.tickets.length,
    });
  }

  return NextResponse.json({ ok: true, handled: false });
}
