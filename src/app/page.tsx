import { EventsTable } from "@/components/events-table";

export default function Page() {
  return (
    <>
      <p>Dashboard hebdomadaire des événements à Bruxelles. Triable par segment, impact, localisation et recherche.</p>
      <EventsTable />
    </>
  );
}
