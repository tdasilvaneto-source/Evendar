import { NextResponse } from "next/server";
import { listEvents, toExportRows } from "@/lib/events";

function toSpreadsheetMl(headers: string[], rows: string[][]) {
  const rowXml = [headers, ...rows]
    .map(
      (row) =>
        `<Row>${row.map((cell) => `<Cell><Data ss:Type=\"String\">${String(cell)}</Data></Cell>`).join("")}</Row>`
    )
    .join("");

  return `<?xml version=\"1.0\"?>
<?mso-application progid=\"Excel.Sheet\"?>
<Workbook xmlns=\"urn:schemas-microsoft-com:office:spreadsheet\" xmlns:ss=\"urn:schemas-microsoft-com:office:spreadsheet\">
<Worksheet ss:Name=\"Events\"><Table>${rowXml}</Table></Worksheet></Workbook>`;
}

export async function GET() {
  const events = await listEvents({});
  const { headers, rows } = toExportRows(events);
  const xml = toSpreadsheetMl(headers, rows);
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/vnd.ms-excel",
      "Content-Disposition": "attachment; filename=brussels-events.xlsx"
    }
  });
}
