export type SchedulingOption = {
  id: string;
  title: string;
  description: string;
  calendlyUrl: string;
  usesZoom: boolean;
};

const defaultCalendlyUrl = "https://calendly.com/keithmuoki";

export const schedulingOptions: SchedulingOption[] = [
  {
    id: "virtual-ticket-zoom",
    title: "Virtual Ticket Zoom Access",
    description: "For virtual attendees who need the official Zoom session access after payment confirmation.",
    calendlyUrl: process.env.NEXT_PUBLIC_CALENDLY_VIRTUAL_EVENT_URL || defaultCalendlyUrl,
    usesZoom: true,
  },
  {
    id: "group-ticket-call",
    title: "Group Ticket Planning Call",
    description: "For churches, teams, organizations, and group leaders who need custom ticket arrangements.",
    calendlyUrl: process.env.NEXT_PUBLIC_CALENDLY_GROUP_TICKET_URL || defaultCalendlyUrl,
    usesZoom: true,
  },
  {
    id: "support-session",
    title: "Ticket Support Session",
    description: "For buyers who need help with payment, QR ticket access, or virtual attendance setup.",
    calendlyUrl: process.env.NEXT_PUBLIC_CALENDLY_SUPPORT_URL || defaultCalendlyUrl,
    usesZoom: true,
  },
];

export function getSchedulingOption(id: string) {
  return schedulingOptions.find((option) => option.id === id);
}

export type CalendlyPrefill = {
  ticketCode?: string;
  orderId?: string;
  buyerName?: string;
  buyerEmail?: string;
};

export function buildCalendlyUrl(baseUrl: string, prefill: CalendlyPrefill = {}) {
  const url = new URL(baseUrl);

  if (prefill.buyerName) {
    url.searchParams.set("name", prefill.buyerName);
  }

  if (prefill.buyerEmail) {
    url.searchParams.set("email", prefill.buyerEmail);
  }

  if (prefill.ticketCode) {
    url.searchParams.set("a1", prefill.ticketCode);
    url.searchParams.set("utm_content", prefill.ticketCode);
  }

  if (prefill.orderId) {
    url.searchParams.set("a2", prefill.orderId);
    url.searchParams.set("utm_term", prefill.orderId);
  }

  url.searchParams.set("utm_source", "ticketing_app");
  url.searchParams.set("utm_medium", "virtual_ticket");

  return url.toString();
}

export function extractZoomJoinUrl(location: unknown) {
  if (!location || typeof location !== "object") return null;

  const record = location as Record<string, unknown>;
  const joinUrl = record.join_url || record.joinUrl || record.url;

  return typeof joinUrl === "string" && joinUrl.startsWith("http") ? joinUrl : null;
}
