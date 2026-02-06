-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "segment" TEXT NOT NULL,
    "expectedPeople" INTEGER,
    "expectedPeopleKnown" BOOLEAN NOT NULL DEFAULT false,
    "event" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "contact" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "recurrence" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "impact" TEXT NOT NULL DEFAULT 'LOW',
    "shortlist" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Event_date_idx" ON "Event"("date");

-- CreateIndex
CREATE INDEX "Event_segment_idx" ON "Event"("segment");

-- CreateIndex
CREATE UNIQUE INDEX "Event_event_date_endDate_location_key" ON "Event"("event", "date", "endDate", "location");
