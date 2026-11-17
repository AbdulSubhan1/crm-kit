# CRM

A CRM built with the [CRM kit](https://github.com/AbdulSubhan1/crm-kit). This README is rewritten by the kit's research step once the business is known.

## What every CRM from the kit starts with

- **Database-driven role-based access control:** a role permission matrix plus all / team / own data scopes, enforced in every query and server action.
- **An audit trail** with a timeline per record.
- **i18n:** English plus the market's languages, right-to-left where needed, for the UI, validation messages and stored data.
- **Its own UI library:** one component per file, a machine-readable registry, a docs-style component library in the app, and lint rules that enforce it.
- **A knowledge base** in the app, with Mermaid diagrams, built from `docs/`.
- **Quality gates:** strict TypeScript, ESLint UI rules, Prettier, Playwright E2E on demand, and CI with an AI PR reviewer that follows `AGENTS.md`.

## Stack

Next.js 15 (App Router, Server Components, Server Actions), TypeScript, Tailwind CSS 4, Drizzle ORM, PostgreSQL (Neon in production, PGlite locally), next-intl, React Hook Form, Zod, Playwright.

## Run locally

No database install is needed.

```bash
npm install
npm run db:setup     # tables + demo data (add -- --reset to start over)
npm run dev
```

## Quality

```bash
npm run check        # types, lint, formatting, UI registry
npm run test:e2e     # Playwright (run `npx playwright install chromium` once)
```

## Read next

- `AGENTS.md`: the coding standard every person and AI follows
- `docs/`: the knowledge base, also at `/kb` in the app
- `/design-system` in the app: the component library

## Deploy (Vercel + Neon)

1. Import the repo in Vercel under your own account.
2. Add a Neon Postgres database under **Storage** with the env prefix `DATABASE`, so it sets `DATABASE_URL`. Put the database and the function region (Settings → Functions) in the same region.
3. Add `AUTH_SECRET`, for example from `openssl rand -base64 32`.
4. Run `DATABASE_URL=<neon url> npm run db:setup` once.
5. Optional: set `MONITOR_URL` and `MONITOR_LOG_TOKEN` to send login events (failed, blocked, succeeded) to a monitor such as Pulse.
