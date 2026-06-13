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
  closesAt: string;
  bestFor: string;
};

export const ticketTypes: TicketType[] = [
  {
    id: "early-bird",
    name: "Early Bird",
    priceKes: 2500,
    description: "Single in-person access at KICC Nairobi.",
    isPublic: true,
    deliveryMode: "physical",
    includesZoom: false,
    requiresScheduling: false,
    closesAt: "Tue Jun 30 2026 11:59 PM",
    bestFor: "1 Man",
  },
  {
    id: "two-men",
    name: "2 Men",
    priceKes: 4500,
    description: "Bring one brother, friend, colleague, son, or partner.",
    isPublic: true,
    deliveryMode: "physical",
    includesZoom: false,
    requiresScheduling: false,
    closesAt: "Tue Jun 30 2026 11:55 PM",
    bestFor: "2 Men",
  },
  {
    id: "five-men",
    name: "5 Men",
    priceKes: 10000,
    description: "Best for teams, churches, families, and men’s groups.",
    isPublic: true,
    deliveryMode: "physical",
    includesZoom: false,
    requiresScheduling: false,
    closesAt: "Tue Jun 30 2026 11:55 PM",
    bestFor: "5 Men",
  },
  {
    id: "virtual",
    name: "Virtual Ticket",
    priceKes: 2500,
    description: "Online access for men joining from outside Kenya or anyone who cannot attend physically.",
    isPublic: true,
    deliveryMode: "virtual",
    includesZoom: true,
    requiresScheduling: true,
    closesAt: "Sat Aug 15 2026 12:00 PM",
    bestFor: "Outside Kenya",
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
