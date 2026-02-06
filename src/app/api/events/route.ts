import { NextResponse } from "next/server";
import { listEvents } from "@/lib/events";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const events = await listEvents({
    segment: (url.searchParams.get("segment") as never) ?? "ALL",
    impact: (url.searchParams.get("impact") as never) ?? "ALL",
    location: url.searchParams.get("location") ?? undefined,
    search: url.searchParams.get("search") ?? undefined,
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
    shortlistOnly: url.searchParams.get("shortlistOnly") === "true"
  });

  return NextResponse.json(events);
}
