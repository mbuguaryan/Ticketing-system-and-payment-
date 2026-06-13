import { NextRequest, NextResponse } from "next/server";
import { normalizeCheckoutInput, validateCheckoutInput } from "@/lib/checkout";
import { initializePaystackTransaction } from "@/lib/paystack";
import { attachPaystackInitialization, createTicketOrder } from "@/lib/ticketing";

function buildErrorRedirect(request: NextRequest, message: string) {
  const url = new URL("/conference/men-conference-2026#tickets", request.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url, { status: 303 });
}

export async function GET(request: NextRequest) {
  return buildErrorRedirect(request, "Please choose a ticket and complete the checkout form.");
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

    const created = await createTicketOrder({
      ticketTypeCode: input.ticketTypeId,
      quantity: input.quantity,
      buyerFullName: input.fullName,
      buyerEmail: input.email,
      buyerPhone: input.phone,
      marketingOptIn: rawInput.marketingOptIn === "on",
    });

    const reference = `MNC2026-${Date.now()}-${created.order.id.slice(0, 8).toUpperCase()}`;
    const callbackUrl = process.env.PAYSTACK_CALLBACK_URL || `${process.env.APP_BASE_URL || request.nextUrl.origin}/payment/callback`;

    const transaction = await initializePaystackTransaction({
      email: input.email,
      amountKes: created.amountKes,
      reference,
      callbackUrl,
      metadata: {
        event: created.event.name,
        eventSlug: created.event.slug,
        orderId: created.order.id,
        ticketTypeCode: created.ticketType.code,
        ticketTypeName: created.ticketType.name,
        deliveryMode: created.ticketType.delivery_mode,
        requiresScheduling: created.ticketType.requires_scheduling,
        includesZoom: created.ticketType.includes_zoom,
        fullName: input.fullName,
        phone: input.phone,
        quantity: input.quantity,
        totalAmountKes: created.amountKes,
      },
    });

    await attachPaystackInitialization({
      orderId: created.order.id,
      reference: transaction.reference,
      accessCode: transaction.access_code,
      authorizationUrl: transaction.authorization_url,
      amountKobo: created.amountKes * 100,
      payload: {
        access_code: transaction.access_code,
        authorization_url: transaction.authorization_url,
        reference: transaction.reference,
      },
    });

    return NextResponse.redirect(transaction.authorization_url, { status: 303 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to initialize payment.";
    return buildErrorRedirect(request, message);
  }
}
