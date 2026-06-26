"use client";

import { useEffect } from "react";

const META_TEST_EVENT_CODE = "TEST36802";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

type MetaPurchaseEventProps = {
  eventId: string;
  value: number;
  currency?: string;
  orderId?: string;
  contentCategory?: string;
};

export default function MetaPurchaseEvent({
  eventId,
  value,
  currency = "KES",
  orderId,
  contentCategory,
}: MetaPurchaseEventProps) {
  useEffect(() => {
    if (value <= 0) return;

    const eventKey = `meta_purchase_${eventId}`;
    if (window.sessionStorage.getItem(eventKey)) return;

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
            content_name: "Men Conference Nairobi 2026",
            content_type: "event_ticket",
            ...(contentCategory ? { content_category: contentCategory } : {}),
            ...(orderId ? { order_id: orderId } : {}),
            test_event_code: META_TEST_EVENT_CODE,
          },
          { eventID: eventId }
        );
        window.sessionStorage.setItem(eventKey, "1");
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
  }, [contentCategory, currency, eventId, orderId, value]);

  return null;
}
