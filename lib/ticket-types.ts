export type TicketType = {
  id: string;
  name: string;
  priceKes: number;
  description: string;
  isPublic: boolean;
};

export const ticketTypes: TicketType[] = [
  {
    id: "early-bird",
    name: "Early Bird",
    priceKes: 1000,
    description: "Limited early access ticket for Men Conference Nairobi 2026.",
    isPublic: true,
  },
  {
    id: "regular",
    name: "Regular",
    priceKes: 1500,
    description: "Standard conference access ticket.",
    isPublic: true,
  },
  {
    id: "vip",
    name: "VIP",
    priceKes: 3000,
    description: "Priority conference access and VIP experience.",
    isPublic: true,
  },
  {
    id: "group",
    name: "Group Ticket",
    priceKes: 0,
    description: "For churches, teams, organizations, and group leaders. Contact admin for pricing.",
    isPublic: true,
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
