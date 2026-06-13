import { NextRequest, NextResponse } from "next/server";
import { finalizePaystackPayment } from "@/lib/ticketing";

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ ok: false, message: "Payment reference is required." }, { status: 400 });
  }

  try {
    const result = await finalizePaystackPayment(reference);

    return NextResponse.json({
      ok: true,
      paid: result.paid,
      message: result.message,
      order: result.order,
      tickets: result.tickets,
      requiresScheduling: result.requiresScheduling,
      transaction: {
        reference: result.transaction.reference,
        status: result.transaction.status,
        amount: result.transaction.amount,
        currency: result.transaction.currency,
        paidAt: result.transaction.paid_at,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify transaction.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
