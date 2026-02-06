import { Prisma, Recurrence } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { impactFromEvent } from "@/lib/normalization";
import { collectAllSources } from "@/lib/sources";
import { EventFilters, NormalizedEvent } from "@/lib/types";

function canon(v: string) {
  return v.toLowerCase().replace(/\s+/g, " ").trim();
}

function areLikelyDuplicates(a: NormalizedEvent, b: NormalizedEvent) {
  return canon(a.event) === canon(b.event) && canon(a.location) === canon(b.location) && Math.abs(a.date.getTime() - b.date.getTime()) < 86400000;
}

function mergeEvents(events: NormalizedEvent[]) {
  const merged: NormalizedEvent[] = [];
  for (const event of events) {
    const existing = merged.find((m) => areLikelyDuplicates(m, event));
    if (!existing) {
      merged.push(event);
      continue;
    }
    existing.endDate = existing.endDate > event.endDate ? existing.endDate : event.endDate;
    if (!existing.expectedPeopleKnown && event.expectedPeopleKnown) {
      existing.expectedPeople = event.expectedPeople;
      existing.expectedPeopleKnown = true;
    }
    if (existing.recurrence === Recurrence.UNKNOWN && event.recurrence !== Recurrence.UNKNOWN) {
      existing.recurrence = event.recurrence;
    }
  }
  return merged;
}

export async function ingestEvents() {
  const sourceRuns = await collectAllSources();
  const raw = sourceRuns.flatMap((run) => run.events);
  const deduped = mergeEvents(raw);

  let created = 0;
  let updated = 0;
  for (const event of deduped) {
    const impact = impactFromEvent(event);
    const data = {
      ...event,
      impact,
      expectedPeople: event.expectedPeopleKnown ? event.expectedPeople : null
    };

    try {
      await prisma.event.create({ data });
      created += 1;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        await prisma.event.update({
          where: {
            event_date_endDate_location: {
              event: event.event,
              date: event.date,
              endDate: event.endDate,
              location: event.location
            }
          },
          data
        });
        updated += 1;
      }
    }
  }

  return {
    created,
    updated,
    fetched: raw.length,
    deduped: deduped.length,
    errors: sourceRuns.flatMap((run) => run.errors)
  };
}

export async function listEvents(filters: EventFilters) {
  const where: Prisma.EventWhereInput = {
    segment: filters.segment && filters.segment !== "ALL" ? filters.segment : undefined,
    impact: filters.impact && filters.impact !== "ALL" ? filters.impact : undefined,
    shortlist: filters.shortlistOnly ? true : undefined,
    location: filters.location ? { contains: filters.location, mode: "insensitive" } : undefined,
    OR: filters.search
      ? [
          { event: { contains: filters.search, mode: "insensitive" } },
          { location: { contains: filters.search, mode: "insensitive" } }
        ]
      : undefined,
    date: filters.from || filters.to ? { gte: filters.from ? new Date(filters.from) : undefined, lte: filters.to ? new Date(filters.to) : undefined } : undefined
  };

  return prisma.event.findMany({ where, orderBy: [{ date: "asc" }, { impact: "desc" }] });
}

function fmtDate(date: Date) {
  return date.toLocaleDateString("en-GB").replace(/\//g, "-");
}

export function toExportRows(events: Awaited<ReturnType<typeof listEvents>>) {
  const headers = [
    "Date",
    "End Date",
    "Segment",
    "Excpected n. of ppl",
    "Event",
    "Location",
    "Website",
    "Contact",
    "Phone",
    "E-mail",
    "Recurrence"
  ];

  const rows = events.map((event) => [
    fmtDate(event.date),
    fmtDate(event.endDate),
    event.segment,
    event.expectedPeopleKnown ? String(event.expectedPeople ?? "") : "unknown",
    event.event,
    event.location,
    event.website,
    event.contact,
    event.phone,
    event.email,
    event.recurrence.toLowerCase().replace("_", "-")
  ]);

  return { headers, rows };
}
