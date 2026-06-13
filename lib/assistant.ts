import { formatKes, ticketTypes } from "@/lib/ticket-types";
import { schedulingOptions } from "@/lib/scheduling";

export type AssistantReply = {
  answer: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
};

export function answerTicketingQuestion(message: string): AssistantReply {
  const text = message.toLowerCase();
  const earlyBird = ticketTypes.find((ticket) => ticket.id === "early-bird");
  const virtual = ticketTypes.find((ticket) => ticket.id === "virtual");
  const groupScheduling = schedulingOptions.find((option) => option.id === "group-ticket-call");
  const virtualScheduling = schedulingOptions.find((option) => option.id === "virtual-ticket-zoom");

  if (text.includes("virtual") || text.includes("zoom") || text.includes("online")) {
    return {
      answer: `The Virtual Ticket is ${virtual ? formatKes(virtual.priceKes) : "KES 2,500"}. After payment, the buyer is guided to the Calendly/Zoom scheduling step so they can receive the correct virtual session access.`,
      primaryAction: { label: "Buy Virtual Ticket", href: "/conference/men-conference-2026?ticket=virtual" },
      secondaryAction: virtualScheduling ? { label: "Schedule Virtual Access", href: virtualScheduling.calendlyUrl } : undefined,
    };
  }

  if (text.includes("early") || text.includes("physical") || text.includes("kicc")) {
    return {
      answer: `The Early Bird Physical Ticket is ${earlyBird ? formatKes(earlyBird.priceKes) : "KES 2,500"}. It is for the in-person Men Conference Nairobi 2026 experience at KICC.`,
      primaryAction: { label: "Buy Early Bird Ticket", href: "/conference/men-conference-2026?ticket=early-bird" },
    };
  }

  if (text.includes("group") || text.includes("church") || text.includes("team") || text.includes("organization")) {
    return {
      answer: "Group tickets are handled through a short planning call so the team can confirm quantity, payment, and access arrangements properly.",
      primaryAction: groupScheduling ? { label: "Schedule Group Ticket Call", href: groupScheduling.calendlyUrl } : { label: "Open Ticket Page", href: "/conference/men-conference-2026" },
      secondaryAction: { label: "View Ticket Page", href: "/conference/men-conference-2026" },
    };
  }

  if (text.includes("pay") || text.includes("payment") || text.includes("paystack")) {
    return {
      answer: "Payments are processed through Paystack. The system creates the order, sends the buyer to Paystack, verifies the transaction on return, and only then issues the QR ticket.",
      primaryAction: { label: "Start Checkout", href: "/conference/men-conference-2026" },
    };
  }

  if (text.includes("help") || text.includes("support") || text.includes("problem")) {
    const support = schedulingOptions.find((option) => option.id === "support-session");
    return {
      answer: "I can help with ticket selection, payment direction, virtual access, group tickets, and QR ticket verification.",
      primaryAction: { label: "Open Ticket Page", href: "/conference/men-conference-2026" },
      secondaryAction: support ? { label: "Schedule Support Session", href: support.calendlyUrl } : undefined,
    };
  }

  return {
    answer: "For Men Conference Nairobi 2026, you can buy an Early Bird Physical Ticket for KES 2,500 or a Virtual Ticket for KES 2,500. Virtual access uses Zoom and can be coordinated through Calendly after payment.",
    primaryAction: { label: "Buy Ticket", href: "/conference/men-conference-2026" },
    secondaryAction: { label: "Schedule Help", href: "/schedule" },
  };
}
