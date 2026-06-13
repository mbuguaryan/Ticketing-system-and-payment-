import { createHash, randomBytes, randomInt } from "crypto";

export function createInternalReference() {
  return `KTM-NBI-2026-${randomInt(100000, 999999)}`;
}

export function createTicketCode(sequence: number) {
  return `KTM-NBI-2026-${String(sequence).padStart(6, "0")}`;
}

export function createRawTicketToken() {
  return randomBytes(32).toString("hex");
}

export function hashTicketToken(rawToken: string) {
  const secret = process.env.TICKET_QR_SECRET;
  if (!secret) {
    throw new Error("Missing TICKET_QR_SECRET");
  }

  return createHash("sha256").update(`${rawToken}:${secret}`).digest("hex");
}
