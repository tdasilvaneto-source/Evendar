# Evendar — DoubleTree Brussels City

Web app interne pour collecter, normaliser, enrichir et exporter des événements impactant Bruxelles.

## Stack
- Next.js 14 (App Router)
- Prisma + SQLite
- API routes internes (ingestion, export, auth)

## MVP inclus
- Collecte multi-sources: RSS + HTML parsing + API publique.
- Normalisation stricte du schéma export.
- Déduplication (event/date/location avec tolérance de date).
- Scoring interne `Impact` (LOW/MEDIUM/HIGH) pour tri UI uniquement.
- Dashboard filtrable + shortlist + fiche d'édition.
- Export CSV obligatoire + export `.xlsx` bonus.
- Login/mot de passe simple via cookie signé.
- Endpoint cron hebdomadaire (à déclencher chaque lundi 09:00 Europe/Brussels).

## Installation
```bash
npm install
cp .env.example .env
npm run prisma:generate
npx prisma migrate dev
npm run dev
```

## Variables d'environnement
Voir `.env.example`.

## Cron hebdomadaire
Déclencher: `GET /api/cron/weekly`

Exemple `crontab` (serveur Europe/Brussels):
```bash
0 9 * * 1 curl -X GET "https://votre-domaine/api/cron/weekly"
```

## Bouton manuel
Le bouton **Refresh now** appelle `POST /api/ingest`.

## Schéma d'export (ordre exact)
`Date, End Date, Segment, Excpected n. of ppl, Event, Location, Website, Contact, Phone, E-mail, Recurrence`

Règles:
- Dates en `DD-MM-YYYY`.
- Si champ introuvable: vide (sauf `Excpected n. of ppl` => `unknown`, `Recurrence` => `unknown`).
- Aucune invention de contact/téléphone/email.

## Sources initiales
1. RSS: Brussels Times feed (`rss:brussels-times`)
2. HTML: Visit Brussels agenda (`html:visit-brussels`)
3. API publique: Nager Public Holidays Belgium (`api:nager-holidays`)

## API routes
- `POST /api/auth/login`: login interne.
- `POST /api/auth/logout`: logout.
- `GET /api/events`: liste + filtres (`segment`, `impact`, `search`, `location`, `from`, `to`, `shortlistOnly`).
- `GET /api/events/:id`: détail.
- `PATCH /api/events/:id`: édition manuelle.
- `POST /api/events/:id/shortlist`: toggle shortlist.
- `POST /api/ingest`: refresh immédiat multi-sources.
- `GET /api/cron/weekly`: endpoint cron.
- `GET /api/export/csv`: export CSV strict.
- `GET /api/export/xlsx`: export XLSX (XML Spreadsheet).

## Ajouter une source
- Implémenter une fonction dans `src/lib/sources/index.ts`.
- Retour attendu: `{ source, events, errors }`.
- Convertir en `NormalizedEvent` puis laisser la pipeline gérer déduplication + upsert.
