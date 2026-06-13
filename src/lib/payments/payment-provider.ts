export type PaymentProviderName =
  | "manual_pesalink"
  | "paystack_pesalink"
  | "bank_api_pesalink"
  | "pesawise_pesalink";

export type PaymentOrder = {
  id: string;
  internal_reference: string;
  total_amount: number;
  currency: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_email: string | null;
};

export type PaymentInstructions = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch?: string;
  amount: number;
  currency: string;
  internalReference: string;
  supportPhone?: string;
};

export type PaymentIntentResult = {
  provider: PaymentProviderName;
  providerReference: string;
  paymentInstructions?: PaymentInstructions;
  checkoutUrl?: string;
  rawResponse?: Record<string, unknown>;
};

export type NormalizedWebhook = {
  providerReference?: string;
  internalReference?: string;
  amount?: number;
  currency?: string;
  status: "paid" | "failed" | "pending";
  rawPayload: unknown;
};

export interface PaymentProvider {
  name: PaymentProviderName;
  createPaymentIntent(order: PaymentOrder): Promise<PaymentIntentResult>;
  verifyWebhook(payload: unknown, headers: Headers): Promise<boolean>;
  normalizeWebhook(payload: unknown): Promise<NormalizedWebhook>;
  getPaymentStatus(reference: string): Promise<NormalizedWebhook>;
}
