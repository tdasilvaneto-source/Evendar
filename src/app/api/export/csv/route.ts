import { NextResponse } from "next/server";
import { listEvents, toExportRows } from "@/lib/events";

export async function GET() {
  const events = await listEvents({});
  const { headers, rows } = toExportRows(events);
  const csv = [headers, ...rows]
    .map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=brussels-events.csv"
    }
  });
}
