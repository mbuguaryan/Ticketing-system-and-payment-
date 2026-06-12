import { NextRequest, NextResponse } from "next/server";
import { answerTicketingQuestion } from "@/lib/assistant";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { message?: string };
    const message = body.message || "";

    if (!message.trim()) {
      return NextResponse.json({
        ok: true,
        reply: answerTicketingQuestion("help"),
      });
    }

    return NextResponse.json({
      ok: true,
      reply: answerTicketingQuestion(message),
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Unable to process assistant request.",
      },
      { status: 400 }
    );
  }
}
