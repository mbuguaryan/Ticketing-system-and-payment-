import QRCode from "qrcode";

export function createTicketVerificationUrl(ticketCode: string, rawToken: string) {
  const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
  const url = new URL("/verify-ticket", baseUrl);
  url.searchParams.set("code", ticketCode);
  url.searchParams.set("token", rawToken);
  return url.toString();
}

export async function createQrDataUrl(value: string) {
  return QRCode.toDataURL(value, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 720
  });
}
