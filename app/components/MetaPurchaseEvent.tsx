"use client";

import { useEffect } from "react";

const META_TEST_EVENT_CODE = "TEST36802";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

type MetaPurchaseEventProps = {
  value: number;
  currency?: string;
  eventId: string;
};

export default function MetaPurchaseEvent({
  value,
  currency = "KES",
  eventId,
}: MetaPurchaseEventProps) {
  useEffect(() => {
    let attempts = 0;
    let timeoutId: number | undefined;

    function trackPurchase() {
      attempts += 1;

      if (typeof window.fbq === "function") {
        window.fbq(
          "track",
          "Purchase",
          {
            value: Number(value.toFixed(2)),
            currency,
            test_event_code: META_TEST_EVENT_CODE,
          },
          { eventID: eventId }
        );
        return;
      }

      if (attempts < 10) {
        timeoutId = window.setTimeout(trackPurchase, 500);
      }
    }

    trackPurchase();

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [currency, eventId, value]);

  return null;
}
