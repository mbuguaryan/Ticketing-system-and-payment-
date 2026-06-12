import { NextRequest, NextResponse } from "next/server";
import { normalizeCheckoutInput, validateCheckoutInput } from "@/lib/checkout";
import { initializePaystackTransaction } from "@/lib/paystack";
import { getTicketType } from "@/lib/ticket-types";

function buildErrorRedirect(request: NextRequest, message: string) {
  const url = new URL("/conference/men-conference-2026", request.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const rawInput = Object.fromEntries(formData.entries());
    const input = normalizeCheckoutInput(rawInput);
    const validationError = validateCheckoutInput(input);

    if (validationError) {
      return buildErrorRedirect(request, validationError);
    }

    const ticketType = getTicketType(input.ticketTypeId);

    if (!ticketType || ticketType.priceKes <= 0) {
      return buildErrorRedirect(request, "Please select a valid paid ticket type.");
    }

    const totalAmountKes = ticketType.priceKes * input.quantity;
    const reference = `MNC2026-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const callbackUrl = process.env.PAYSTACK_CALLBACK_URL || `${process.env.APP_BASE_URL || request.nextUrl.origin}/payment/callback`;

    const transaction = await initializePaystackTransaction({
      email: input.email,
      amountKes: totalAmountKes,
      reference,
      callbackUrl,
      metadata: {
        event: "Men Conference Nairobi 2026",
        fullName: input.fullName,
        phone: input.phone,
        ticketTypeId: input.ticketTypeId,
        ticketTypeName: ticketType.name,
        quantity: input.quantity,
        totalAmountKes,
      },
    });

    return NextResponse.redirect(transaction.authorization_url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to initialize payment.";
    return buildErrorRedirect(request, message);
  }
}
