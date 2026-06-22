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
    let timeoutId: number | undefined;

    const safeContents = contents.length > 0 ? contents : [{ id: "men-conference-2026", quantity: 1 }];
    const contentIds = safeContents.map((item) => item.id);
    const numItems = safeContents.reduce((total, item) => total + item.quantity, 0) || 1;

    function trackPurchase() {
      attempts += 1;

      if (typeof window.fbq === "function") {
        window.fbq(
          "track",
          "Purchase",
          {
            value: Number(value.toFixed(2)),
            currency,
            contents: safeContents,
            content_ids: contentIds,
            content_name: contentName,
            content_type: "product",
            content_category: "Event Ticket",
            num_items: numItems,
            order_id: eventId,
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
  }, [contentName, contents, currency, eventId, value]);

  return null;
}
