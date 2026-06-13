type PaystackInitializePayload = {
  email: string;
  amountKes: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
};

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
    paid_at: string | null;
    customer?: {
      email?: string;
    };
    metadata?: Record<string, unknown>;
  };
};

const PAYSTACK_BASE_URL = "https://api.paystack.co";

function getSecretKey() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is missing. Add it to .env.local before taking real payments.");
  }

  return secretKey;
}

export async function initializePaystackTransaction(payload: PaystackInitializePayload) {
  const amountInKobo = payload.amountKes * 100;

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: payload.email,
      amount: amountInKobo,
      currency: "KES",
      reference: payload.reference,
      callback_url: payload.callbackUrl,
      metadata: payload.metadata,
    }),
  });

  const data = (await response.json()) as PaystackInitializeResponse;

  if (!response.ok || !data.status || !data.data?.authorization_url) {
    throw new Error(data.message || "Unable to initialize Paystack transaction.");
  }

  return data.data;
}

export async function verifyPaystackTransaction(reference: string) {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
    },
  });

  const data = (await response.json()) as PaystackVerifyResponse;

  if (!response.ok || !data.status || !data.data) {
    throw new Error(data.message || "Unable to verify Paystack transaction.");
  }

  return data.data;
}
