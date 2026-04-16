# Admin Web

This Next.js app is the future Hydra admin panel:

- SPA and server-side routes live in one project
- local admin users live in this app's PostgreSQL database
- Prisma manages the schema, migrations, and seed data
- server-side Next handlers will wrap Hydra's Admin API later

## Local Setup

1. Copy the environment template:

```bash
cp .env.example .env
```

2. Bootstrap everything:

```bash
./init
```

That script:

- resets the local Docker services
- installs Bun dependencies
- starts PostgreSQL
- runs Prisma migrations
- seeds the first admin user from `.env`
- starts the Next dev server

## Prisma Commands

```bash
bun run db:migrate
bun run db:seed
bun run db:studio
```

## Initial Data

The seed script creates one `SUPER_ADMIN` using:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`

## Current Scope

This setup only covers the admin app platform:

- Next.js app scaffold
- local PostgreSQL container
- Prisma schema and seed
- Bun-based bootstrap flow

Admin login screens and the Hydra wrapper routes come next.
