import { NextResponse } from "next/server";
import { ingestEvents } from "@/lib/events";

export async function POST() {
  const result = await ingestEvents();
  return NextResponse.json(result);
}
