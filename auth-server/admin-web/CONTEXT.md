# Agent Context — admin-web

You have been pointed at this file to get up to speed before doing any work.
Read it fully, then read the files listed under **Read next**, then confirm your
understanding before touching any code.

---

## What this is

`admin-web` is a **secured proxy and GUI** on top of Ory Hydra's admin API
(`localhost:4445`). Hydra has no built-in auth — this Next.js app wraps every
Hydra admin operation behind a NextAuth.js credential login. The Hydra admin
API is never exposed directly.

The broader monorepo lives at `~/repos/IdP`:

```
IdP/
├── auth-server/
│   ├── hydra/        # Ory Hydra v25.4.0 (Docker)
│   └── admin-web/    # ← you are here
└── resource-server/  # NestJS 11 — blank canvas, not in scope yet
```

---

## Read next

Read these files in order before writing any code:

1. `AGENTS.md` — architecture rules, coding style, patterns to enforce, UX
   conventions, and things to watch out for in this codebase.
2. `src/lib/types/hydra-client.types.ts` — Zod schemas for all Hydra types.
3. `src/lib/hydra/admin-client.ts` — how Hydra calls are wrapped.
4. `src/lib/api/hydra-clients.ts` — client-side callers.
5. `src/app/api/v1/hydra/clients/route.ts` — reference route handler.
6. `src/components/ClientsDashboard.tsx` — reference client component.

---

## Current state (2026-04-15)

### Done
- Admin login (NextAuth.js credentials, JWT session, Prisma `AdminUser`)
- OAuth2 client **list** — stats cards + table, live updates on mutation
- OAuth2 client **creation** — scope tag input, in-button loading, inline field
  errors, one-time secret display after creation
- OAuth2 client **deletion** — GitHub-style typed confirmation modal, optimistic
  removal from table and stats

### Not yet implemented
- Client **View** and **Edit** — buttons exist in the table but are not wired up
- Resource server logic

### Known TODOs before production
- Remove `DEV_BYPASS_AUTH` env var, `lib/util/dev.ts`, and all call sites marked
  `⚠️  TODO: REMOVE BEFORE PRODUCTION`

---

## How to work with the user

- **Step by step.** Implement one piece at a time and stop for review. Do not
  build everything at once.
- **No builds mid-session.** Do not run `bun run build` between steps. Only
  build when explicitly asked or at the end of a session.
- **Explain before doing** on anything architectural or multi-file. State the
  plan and get a confirmation before writing code.
- **No summaries at the end** of responses — the user can read the diff.

---

## Key commands

```bash
bun run dev          # start dev server (http://localhost:3000)
bun run build        # production build
bun run lint         # ESLint
bun run db:migrate   # Prisma migrations
bun run db:seed      # seed admin user from .env
docker compose -f ../compose.yml up -d        # Hydra + its PostgreSQL
docker compose up -d postgres                 # admin-web PostgreSQL (5433)
```

---

## Reference architecture (from `~/repos/DefensasFIC`)

This codebase follows the same layered pattern as `~/repos/DefensasFIC`. When
in doubt about how to structure something, read the equivalent file there.

| Layer | Location | Rule |
|---|---|---|
| DB queries | `lib/db/` | `safeDbCall()` → `Result<T, DbError>` |
| Hydra calls | `lib/hydra/` | `safeHydraCall()` → `Result<T, HydraError>` |
| API types | `lib/types/` | Zod schema + `z.infer<>` — shared by route and client |
| Error builders | `lib/util/api.ts` | `unauthorizedError`, `notFoundError`, etc. |
| Client callers | `lib/api/` | `apiFetch` + `handleErrorResponse` → `ApiResult<T>` |
