"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    fbq?: (
      command: "track",
      eventName: "Purchase",
      parameters: Record<string, string | number>
    ) => void;
  }
}

type MetaPurchaseEventProps = {
  orderId: string;
  value: number;
  currency: string;
  contentCategory: string;
};

export default function MetaPurchaseEvent({
  orderId,
  value,
  currency,
  contentCategory,
}: MetaPurchaseEventProps) {
  useEffect(() => {
    if (typeof window.fbq !== "function" || value <= 0) return;

    const eventKey = `meta_purchase_${orderId}`;
    if (window.sessionStorage.getItem(eventKey)) return;

    window.fbq("track", "Purchase", {
      value,
      currency,
      content_name: "Men Conference Nairobi 2026",
      content_type: "event_ticket",
      content_category: contentCategory,
      order_id: orderId,
    });
    window.sessionStorage.setItem(eventKey, "1");
  }, [contentCategory, currency, orderId, value]);

  return null;
}
