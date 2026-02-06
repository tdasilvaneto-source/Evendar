import { Recurrence } from "@prisma/client";
import { inferRecurrence, inferSegment, normalizeUnknown, toBrusselsDate } from "@/lib/normalization";
import { NormalizedEvent } from "@/lib/types";

type SourceResult = {
  source: string;
  events: NormalizedEvent[];
  errors: string[];
};

function textBetween(value: string, start: string, end: string): string[] {
  const out: string[] = [];
  let cursor = 0;
  while (cursor < value.length) {
    const i = value.indexOf(start, cursor);
    if (i < 0) break;
    const j = value.indexOf(end, i + start.length);
    if (j < 0) break;
    out.push(value.slice(i + start.length, j));
    cursor = j + end.length;
  }
  return out;
}

async function fromRss(): Promise<SourceResult> {
  const source = "rss:brussels-times";
  try {
    const xml = await fetch("https://www.brusselstimes.com/feed", { cache: "no-store" }).then((r) => r.text());
    const items = textBetween(xml, "<item>", "</item>").slice(0, 20);
    const events = items
      .map((item) => {
        const title = textBetween(item, "<title>", "</title>")[0] ?? "";
        const link = textBetween(item, "<link>", "</link>")[0] ?? "";
        const pubDate = textBetween(item, "<pubDate>", "</pubDate>")[0] ?? "";
        const date = toBrusselsDate(pubDate);
        if (!title.toLowerCase().includes("brussels")) return null;
        const rec = inferRecurrence(title);
        return {
          date,
          endDate: date,
          segment: inferSegment(title),
          ...normalizeUnknown(null),
          event: title.replace(/<!\[CDATA\[|\]\]>/g, "").trim(),
          location: "Brussels (city wide)",
          website: link.trim(),
          contact: "",
          phone: "",
          email: "",
          recurrence: rec,
          source
        } satisfies NormalizedEvent;
      })
      .filter((item): item is NormalizedEvent => Boolean(item));
    return { source, events, errors: [] };
  } catch (error) {
    return { source, events: [], errors: [String(error)] };
  }
}

async function fromHtml(): Promise<SourceResult> {
  const source = "html:visit-brussels";
  try {
    const html = await fetch("https://www.visit.brussels/en/visitors/agenda", { cache: "no-store" }).then((r) => r.text());
    const cards = textBetween(html, "data-title=\"", "\"");
    const events = cards.slice(0, 20).map((title) => {
      const date = new Date();
      return {
        date,
        endDate: date,
        segment: inferSegment(title),
        ...normalizeUnknown(null),
        event: title.trim(),
        location: "Brussels",
        website: "https://www.visit.brussels/en/visitors/agenda",
        contact: "",
        phone: "",
        email: "",
        recurrence: inferRecurrence(title),
        source
      } satisfies NormalizedEvent;
    });
    return { source, events, errors: [] };
  } catch (error) {
    return { source, events: [], errors: [String(error)] };
  }
}

async function fromApi(): Promise<SourceResult> {
  const source = "api:nager-holidays";
  try {
    const year = new Date().getFullYear();
    const rows = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/BE`, { cache: "no-store" }).then((r) =>
      r.json() as Promise<Array<{ date: string; localName: string; name: string }>>
    );
    const events = rows.map((row) => {
      const date = toBrusselsDate(row.date);
      return {
        date,
        endDate: date,
        segment: "POLITICAL_EU",
        ...normalizeUnknown(null),
        event: `${row.localName} (${row.name})`,
        location: "Belgium (national, impacts Brussels)",
        website: "https://date.nager.at/swagger/index.html",
        contact: "",
        phone: "",
        email: "",
        recurrence: Recurrence.ANNUAL,
        source
      } satisfies NormalizedEvent;
    });
    return { source, events, errors: [] };
  } catch (error) {
    return { source, events: [], errors: [String(error)] };
  }
}

export async function collectAllSources() {
  const runs = await Promise.all([fromRss(), fromHtml(), fromApi()]);
  return runs;
}
