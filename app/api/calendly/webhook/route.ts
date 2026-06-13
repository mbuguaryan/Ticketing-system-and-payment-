import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as {
    event?: string;
    payload?: {
      uri?: string;
      email?: string;
      name?: string;
      event?: string;
      scheduled_event?: {
        uri?: string;
        location?: unknown;
      };
    };
  };

  // Database phase: verify Calendly signature, store invitee URI, event URI, and Zoom location data against the paid order.
  return NextResponse.json({
    ok: true,
    received: true,
    event: payload.event || null,
  });
}
