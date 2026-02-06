"use client";

import { useEffect, useState } from "react";

type EventDto = {
  id: string;
  event: string;
  location: string;
  website: string;
  contact: string;
  phone: string;
  email: string;
  expectedPeopleKnown: boolean;
  expectedPeople: number | null;
};

export default function EventDetail({ params }: { params: { id: string } }) {
  const [item, setItem] = useState<EventDto | null>(null);

  useEffect(() => {
    fetch(`/api/events/${params.id}`).then((r) => r.json()).then(setItem);
  }, [params.id]);

  if (!item) return <div className="card">Loading...</div>;

  return (
    <div className="card">
      <h2>Éditer événement</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          await fetch(`/api/events/${params.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Object.fromEntries(form.entries()))
          });
          window.location.href = "/";
        }}
      >
        <input name="event" defaultValue={item.event} />
        <input name="location" defaultValue={item.location} />
        <input name="website" defaultValue={item.website} />
        <input name="contact" defaultValue={item.contact} placeholder="Contact" />
        <input name="phone" defaultValue={item.phone} placeholder="Phone" />
        <input name="email" defaultValue={item.email} placeholder="E-mail" />
        <input name="expectedPeople" defaultValue={item.expectedPeopleKnown ? String(item.expectedPeople ?? "") : "unknown"} />
        <button type="submit">Save</button>
      </form>
    </div>
  );
}
