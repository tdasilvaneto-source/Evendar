"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type EventRow = {
  id: string;
  date: string;
  endDate: string;
  segment: string;
  expectedPeople: number | null;
  expectedPeopleKnown: boolean;
  event: string;
  location: string;
  website: string;
  contact: string;
  phone: string;
  email: string;
  recurrence: string;
  impact: string;
  shortlist: boolean;
};

export function EventsTable({ shortlistOnly = false }: { shortlistOnly?: boolean }) {
  const [rows, setRows] = useState<EventRow[]>([]);
  const [segment, setSegment] = useState("ALL");
  const [impact, setImpact] = useState("ALL");
  const [search, setSearch] = useState("");

  async function load() {
    const qs = new URLSearchParams({ segment, impact, search, shortlistOnly: String(shortlistOnly) });
    const data = await fetch(`/api/events?${qs.toString()}`, { cache: "no-store" }).then((r) => r.json());
    setRows(data);
  }

  useEffect(() => {
    load();
  }, [segment, impact, search, shortlistOnly]);

  const sorted = useMemo(() => [...rows].sort((a, b) => a.date.localeCompare(b.date)), [rows]);

  return (
    <div className="card">
      <div>
        <button onClick={async () => { await fetch("/api/ingest", { method: "POST" }); await load(); }}>Refresh now</button>
        <select value={segment} onChange={(e) => setSegment(e.target.value)}>
          {['ALL','MICE_CONFERENCE','TRADE_FAIR','CONCERT','SPORT','FESTIVAL','POLITICAL_EU','CORPORATE','CULTURAL','OTHER'].map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={impact} onChange={(e) => setImpact(e.target.value)}>
          {['ALL','LOW','MEDIUM','HIGH'].map((s) => <option key={s}>{s}</option>)}
        </select>
        <input placeholder="search" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <table>
        <thead><tr><th>Date</th><th>Event</th><th>Segment</th><th>Impact</th><th>Location</th><th>Expected</th><th>Shortlist</th></tr></thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.id}>
              <td>{new Date(row.date).toLocaleDateString("fr-BE")}</td>
              <td><Link href={`/events/${row.id}`}>{row.event}</Link></td>
              <td>{row.segment}</td>
              <td>{row.impact}</td>
              <td>{row.location}</td>
              <td>{row.expectedPeopleKnown ? row.expectedPeople : "unknown"}</td>
              <td>
                <button onClick={async () => { await fetch(`/api/events/${row.id}/shortlist`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ shortlist: !row.shortlist }) }); await load(); }}>
                  {row.shortlist ? "Remove" : "Add"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
