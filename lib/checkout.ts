export type CheckoutInput = {
  fullName: string;
  email: string;
  phone: string;
  ticketTypeId: string;
  quantity: number;
};

export function normalizeCheckoutInput(input: Record<string, unknown>): CheckoutInput {
  return {
    fullName: String(input.fullName ?? "").trim(),
    email: String(input.email ?? "").trim().toLowerCase(),
    phone: String(input.phone ?? "").trim(),
    ticketTypeId: String(input.ticketTypeId ?? "").trim(),
    quantity: Number(input.quantity ?? 1),
  };
}

export function validateCheckoutInput(input: CheckoutInput): string | null {
  if (input.fullName.length < 2) return "Full name is required.";
  if (!input.email.includes("@")) return "A valid email is required.";
  if (input.phone.length < 7) return "Phone is required.";
  if (!input.ticketTypeId) return "Ticket type is required.";
  if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > 20) {
    return "Quantity must be between 1 and 20.";
  }
  return null;
}
