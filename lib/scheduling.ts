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
