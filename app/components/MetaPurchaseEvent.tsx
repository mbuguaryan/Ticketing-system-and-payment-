"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

type MetaPurchaseEventProps = {
  value: number;
  currency?: string;
  eventId: string;
  contentName?: string;
  contents?: Array<{
    id: string;
    quantity: number;
  }>;
};

export default function MetaPurchaseEvent({
  value,
  currency = "KES",
  eventId,
  contentName = "Men’s Conference 2026 Ticket",
  contents = [],
}: MetaPurchaseEventProps) {
  useEffect(() => {
    let attempts = 0;
    let timeoutId: ReturnType<typeof window.setTimeout> | undefined;

    function trackPurchase() {
      attempts += 1;

      if (typeof window.fbq === "function") {
        window.fbq(
          "track",
          "Purchase",
          {
            value,
            currency,
            content_name: contentName,
            content_type: "product",
            contents,
            num_items: contents.reduce((total, item) => total + item.quantity, 0) || 1,
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
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [contentName, contents, currency, eventId, value]);

  return null;
}
