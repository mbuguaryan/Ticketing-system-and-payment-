import { createHash } from "crypto";

type SendMetaPurchaseEventInput = {
  eventId: string;
  value: number;
  currency?: string;
  email?: string | null;
  phone?: string | null;
  eventSourceUrl?: string;
};

function normalize(value?: string | null) {
  return String(value || "").trim().toLowerCase();
}

function hashSha256(value?: string | null) {
  const normalized = normalize(value);

  if (!normalized || normalized === "not-collected") {
    return undefined;
  }

  return createHash("sha256").update(normalized).digest("hex");
}

export async function sendMetaPurchaseServerEvent({
  eventId,
  value,
  currency = "KES",
  email,
  phone,
  eventSourceUrl,
}: SendMetaPurchaseEventInput) {
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  const pixelId = process.env.META_PIXEL_ID || "1303991068337809";
  const testEventCode = process.env.META_TEST_EVENT_CODE;

  if (!accessToken || !pixelId) {
    return { skipped: true, reason: "Meta CAPI credentials missing." };
  }

  const hashedEmail = hashSha256(email);
  const hashedPhone = hashSha256(phone);

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: eventSourceUrl,
        user_data: {
          ...(hashedEmail ? { em: [hashedEmail] } : {}),
          ...(hashedPhone ? { ph: [hashedPhone] } : {}),
        },
        custom_data: {
          value: Number(value.toFixed(2)),
          currency,
        },
      },
    ],
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
  };

  try {
    const response = await fetch(`https://graph.facebook.com/v20.0/${pixelId}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        access_token: accessToken,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Meta CAPI Purchase event failed", errorBody);
      return { ok: false, status: response.status, error: errorBody };
    }

    return { ok: true, status: response.status };
  } catch (error) {
    console.error("Meta CAPI Purchase event error", error);
    return { ok: false, error };
  }
}
