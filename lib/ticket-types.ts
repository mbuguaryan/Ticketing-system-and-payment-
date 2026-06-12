export type TicketDeliveryMode = "physical" | "virtual" | "manual";

export type TicketType = {
  id: string;
  name: string;
  priceKes: number;
  description: string;
  isPublic: boolean;
  deliveryMode: TicketDeliveryMode;
  includesZoom: boolean;
  requiresScheduling: boolean;
};

export const ticketTypes: TicketType[] = [
  {
    id: "early-bird",
    name: "Early Bird Physical Ticket",
    priceKes: 2500,
    description: "Early Bird access for the in-person Men Conference Nairobi 2026 experience at KICC.",
    isPublic: true,
    deliveryMode: "physical",
    includesZoom: false,
    requiresScheduling: false,
  },
  {
    id: "virtual",
    name: "Virtual Ticket",
    priceKes: 2500,
    description: "Virtual access for attendees joining online through the official Zoom session.",
    isPublic: true,
    deliveryMode: "virtual",
    includesZoom: true,
    requiresScheduling: true,
  },
  {
    id: "vip",
    name: "VIP",
    priceKes: 5000,
    description: "Priority conference access and premium experience.",
    isPublic: true,
    deliveryMode: "physical",
    includesZoom: false,
    requiresScheduling: false,
  },
  {
    id: "group",
    name: "Group Ticket",
    priceKes: 0,
    description: "For churches, teams, organizations, and group leaders. Contact admin for pricing.",
    isPublic: true,
    deliveryMode: "manual",
    includesZoom: false,
    requiresScheduling: true,
  },
];

export function getTicketType(ticketTypeId: string) {
  return ticketTypes.find((ticketType) => ticketType.id === ticketTypeId);
}

export function formatKes(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}
