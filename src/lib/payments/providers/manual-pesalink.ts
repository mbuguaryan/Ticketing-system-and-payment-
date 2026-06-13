import type { PaymentOrder, PaymentProvider } from "../payment-provider";

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

export const manualPesaLinkProvider: PaymentProvider = {
  name: "manual_pesalink",
  async createPaymentIntent(order: PaymentOrder) {
    const instructions = {
      bankName: requiredEnv("PESALINK_BANK_NAME"),
      accountName: requiredEnv("PESALINK_ACCOUNT_NAME"),
      accountNumber: requiredEnv("PESALINK_ACCOUNT_NUMBER"),
      branch: process.env.PESALINK_BRANCH,
      amount: order.total_amount,
      currency: order.currency,
      internalReference: order.internal_reference,
      supportPhone: process.env.PESALINK_SUPPORT_PHONE
    };

    return {
      provider: "manual_pesalink",
      providerReference: order.internal_reference,
      paymentInstructions: instructions,
      rawResponse: { mode: "manual_pesalink", instructions }
    };
  },
  async verifyWebhook() {
    return false;
  },
  async normalizeWebhook(payload: unknown) {
    return {
      status: "pending",
      rawPayload: payload
    };
  },
  async getPaymentStatus(reference: string) {
    return {
      providerReference: reference,
      status: "pending",
      rawPayload: { mode: "manual_pesalink" }
    };
  }
};
