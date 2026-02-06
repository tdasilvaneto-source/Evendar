import { Impact, Recurrence, Segment } from "@prisma/client";

export type NormalizedEvent = {
  date: Date;
  endDate: Date;
  segment: Segment;
  expectedPeople: number | null;
  expectedPeopleKnown: boolean;
  event: string;
  location: string;
  website: string;
  contact: string;
  phone: string;
  email: string;
  recurrence: Recurrence;
  source: string;
};

export type EventFilters = {
  segment?: Segment | "ALL";
  impact?: Impact | "ALL";
  location?: string;
  search?: string;
  from?: string;
  to?: string;
  shortlistOnly?: boolean;
};
