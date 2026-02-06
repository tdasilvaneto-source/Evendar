import { EventsTable } from "@/components/events-table";

export default function ShortlistPage() {
  return (
    <>
      <h2>Shortlist</h2>
      <EventsTable shortlistOnly />
    </>
  );
}
