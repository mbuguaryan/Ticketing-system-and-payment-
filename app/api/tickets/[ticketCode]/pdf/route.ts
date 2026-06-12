import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { getTicketByCode } from "@/lib/ticketing";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ticketCode: string }> }
) {
  const { ticketCode } = await params;
  const ticket = await getTicketByCode(ticketCode);

  if (!ticket) {
    return NextResponse.json({ ok: false, message: "Ticket not found." }, { status: 404 });
  }

  const ticketType = ticket.ticket_types;
  const order = ticket.ticket_orders;
  const event = order?.events;
  const isVirtual = ticketType?.delivery_mode === "virtual";
  const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const verifyUrl = `${appBaseUrl}/verify-ticket?code=${encodeURIComponent(ticket.ticket_code)}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 2, width: 420 });

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(8, 8, 8);
  doc.rect(0, 0, pageWidth, 297, "F");

  doc.setFillColor(214, 168, 79);
  doc.rect(0, 0, pageWidth, 24, "F");

  doc.setTextColor(18, 13, 4);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("MEN'S CONFERENCE 2026", 14, 15);

  doc.setTextColor(247, 242, 232);
  doc.setFontSize(28);
  doc.text(isVirtual ? "VIRTUAL TICKET" : "GATE TICKET", 14, 42);

  doc.setTextColor(214, 168, 79);
  doc.setFontSize(12);
  doc.text("KEITH MUOKI PRESENTS", 14, 52);

  doc.setDrawColor(58, 43, 20);
  doc.roundedRect(14, 62, pageWidth - 28, 78, 4, 4);

  doc.setTextColor(216, 201, 174);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Ticket Code", 20, 75);
  doc.setTextColor(247, 242, 232);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(String(ticket.ticket_code), 20, 84, { maxWidth: 112 });

  doc.setTextColor(216, 201, 174);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Holder", 20, 101);
  doc.setTextColor(247, 242, 232);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(String(ticket.holder_name || order?.buyer_full_name || "Ticket Holder"), 20, 110, { maxWidth: 112 });

  doc.setTextColor(216, 201, 174);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Ticket Type", 20, 126);
  doc.setTextColor(247, 242, 232);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(String(ticketType?.name || "Ticket"), 20, 135, { maxWidth: 112 });

  doc.addImage(qrDataUrl, "PNG", pageWidth - 70, 72, 46, 46);
  doc.setFontSize(8);
  doc.setTextColor(216, 201, 174);
  doc.text("Scan at verification", pageWidth - 68, 126);

  doc.setDrawColor(58, 43, 20);
  doc.roundedRect(14, 152, pageWidth - 28, 58, 4, 4);

  doc.setTextColor(214, 168, 79);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("EVENT DETAILS", 20, 166);

  doc.setTextColor(247, 242, 232);
  doc.setFontSize(12);
  doc.text(event?.name || "Men's Conference 2026", 20, 178, { maxWidth: 160 });
  doc.text(`Date: ${event?.event_date || "15 August 2026"}`, 20, 190);
  doc.text(isVirtual ? "Access: Online / Virtual" : `Venue: ${event?.venue || "KICC Nairobi"}`, 20, 202);

  doc.setDrawColor(58, 43, 20);
  doc.roundedRect(14, 222, pageWidth - 28, 42, 4, 4);
  doc.setTextColor(214, 168, 79);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("INSTRUCTIONS", 20, 236);

  doc.setTextColor(216, 201, 174);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const instruction = isVirtual
    ? "This is a virtual ticket. Keep this PDF and follow the virtual access instructions sent after confirmation."
    : "Print this PDF or show it on your phone at the gate. This ticket can be checked in only once.";
  doc.text(instruction, 20, 248, { maxWidth: 170 });

  doc.setFontSize(9);
  doc.setTextColor(140, 128, 109);
  doc.text("Enquiries: 0750 886 617", 14, 284);
  doc.text("Generated after verified payment", pageWidth - 70, 284);

  const pdfArrayBuffer = doc.output("arraybuffer");

  return new NextResponse(Buffer.from(pdfArrayBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="mens-conference-ticket-${ticket.ticket_code}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
