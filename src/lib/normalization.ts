import { Impact, Recurrence, Segment } from "@prisma/client";
import { NormalizedEvent } from "@/lib/types";

export const SEGMENTS: Segment[] = [
  "MICE_CONFERENCE",
  "TRADE_FAIR",
  "CONCERT",
  "SPORT",
  "FESTIVAL",
  "POLITICAL_EU",
  "CORPORATE",
  "CULTURAL",
  "OTHER"
];

export function toBrusselsDate(value: string | Date): Date {
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

export function inferSegment(text: string): Segment {
  const t = text.toLowerCase();
  if (/(conference|summit|forum|congress|mice)/.test(t)) return "MICE_CONFERENCE";
  if (/(expo|trade|fair|salon)/.test(t)) return "TRADE_FAIR";
  if (/(concert|live|music|tour)/.test(t)) return "CONCERT";
  if (/(match|cup|league|sport|marathon)/.test(t)) return "SPORT";
  if (/(festival)/.test(t)) return "FESTIVAL";
  if (/(eu|commission|parliament|nato|politic)/.test(t)) return "POLITICAL_EU";
  if (/(corporate|business|meeting|board)/.test(t)) return "CORPORATE";
  if (/(museum|culture|exhibition|art|theatre)/.test(t)) return "CULTURAL";
  return "OTHER";
}

export function inferRecurrence(text: string): Recurrence {
  const t = text.toLowerCase();
  if (/(annual|yearly|every year)/.test(t)) return "ANNUAL";
  if (/(monthly|every month)/.test(t)) return "MONTHLY";
  if (/(weekly|every week)/.test(t)) return "WEEKLY";
  if (/(one-off|special edition|once)/.test(t)) return "ONE_OFF";
  return "UNKNOWN";
}

export function impactFromEvent(event: NormalizedEvent): Impact {
  let score = 0;
  if (event.segment === "TRADE_FAIR" || event.segment === "MICE_CONFERENCE") score += 2;
  if (event.segment === "CONCERT" || event.segment === "SPORT") score += 1;
  if (event.expectedPeopleKnown && (event.expectedPeople ?? 0) >= 10000) score += 2;
  if (event.expectedPeopleKnown && (event.expectedPeople ?? 0) >= 3000) score += 1;
  const duration = Math.max(1, Math.ceil((event.endDate.getTime() - event.date.getTime()) / 86400000) + 1);
  if (duration >= 3) score += 1;
  if (/(brussels expo|palais 12|tour & taxis|forest national)/i.test(event.location)) score += 1;
  if (score >= 4) return "HIGH";
  if (score >= 2) return "MEDIUM";
  return "LOW";
}

export function normalizeUnknown(value: number | null): { expectedPeople: number | null; expectedPeopleKnown: boolean } {
  if (value === null || Number.isNaN(value)) return { expectedPeople: null, expectedPeopleKnown: false };
  return { expectedPeople: Math.max(0, Math.round(value)), expectedPeopleKnown: true };
}
