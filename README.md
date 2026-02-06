# 3D Print Cost Calculator

Internal tool for calculating 3D print cost, pricing, and margin in UAH. Built with Next.js App Router, Prisma + SQLite, Tailwind, and a Three.js STL viewer.

## Features
- Project workspace with autosave, STL upload + viewer, and live cost breakdown.
- Global settings for electricity and labor.
- CRUD for printers, materials, services.
- Optional monthly summary reports.

## Tech Stack
- Next.js (App Router) + TypeScript
- Tailwind + shadcn/ui-style components
- Prisma + SQLite
- react-hook-form + zod
- three.js + STLLoader

## Setup

```bash
npm install
```

Create and migrate the database:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Seed initial data:

```bash
npm run seed
```

Run dev server:

```bash
npm run dev
```

Open http://localhost:3000/projects

## Notes
- STL uploads are stored under `public/uploads`.
- Autosave triggers ~800ms after changes.
- Currency displays as integer UAH, internal math keeps 2 decimals.

## Screenshots
After running the app, check `/projects` to see the main editor with sidebar, and `/settings` for directories.
