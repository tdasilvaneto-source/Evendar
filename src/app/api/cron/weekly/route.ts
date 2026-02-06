import { NextResponse } from "next/server";
import { ingestEvents } from "@/lib/events";

export async function GET() {
  const result = await ingestEvents();
  return NextResponse.json({ scheduledAt: new Date().toISOString(), ...result });
}
