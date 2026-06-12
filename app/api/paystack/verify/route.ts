import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackTransaction } from "@/lib/paystack";

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ ok: false, message: "Payment reference is required." }, { status: 400 });
  }

  try {
    const transaction = await verifyPaystackTransaction(reference);

    return NextResponse.json({
      ok: true,
      reference: transaction.reference,
      status: transaction.status,
      amount: transaction.amount,
      currency: transaction.currency,
      paidAt: transaction.paid_at,
      metadata: transaction.metadata || {},
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify transaction.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
