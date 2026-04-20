# Auth Admin Panel

Next.js admin console for managing Ory Hydra OAuth2 clients. It acts as a secured proxy in front of Hydra's unauthenticated admin API — all Hydra operations require an authenticated admin session.

## Tech Stack

- **Next.js 16** (App Router) · **React 19** · **Bun**
- **NextAuth.js 5** — credential login, JWT sessions
- **Prisma 7** + **PostgreSQL** — admin user storage
- **Tailwind CSS 4** · **Zod** · **ts-results**

## Features

- Admin login (email + password, bcrypt, JWT session)
- OAuth2 client list with stats (total / machine / public)
- OAuth2 client creation (client credentials grant, scope tag input, one-time secret display)
- OAuth2 client deletion (typed confirmation modal, optimistic UI)

## Local Setup

**Prerequisites:** Docker, Bun. The Hydra stack (`../auth-server/compose.yml`) must be running.

1. Copy and fill in the environment file:

```bash
cp .env.example .env
```

Key variables to set:

| Variable            | Description                                                 |
| ------------------- | ----------------------------------------------------------- |
| `DATABASE_PASSWORD` | Password for the local admin Postgres                       |
| `DATABASE_URL`      | Full connection string (update password to match)           |
| `PORT`              | Local Next.js port (default: `3001`)                        |
| `AUTH_SECRET`       | Random secret for NextAuth — `openssl rand -hex 32`         |
| `ADMIN_EMAIL`       | Email for the seeded admin account                          |
| `ADMIN_PASSWORD`    | Password for the seeded admin account                       |
| `HYDRA_ADMIN_URL`   | Hydra admin API base URL (default: `http://127.0.0.1:4445`) |

2. Run the bootstrap script:

```bash
./init.sh
```

This will: start the local Postgres container, install dependencies, run Prisma migrations, seed the first admin user, and start the dev server at `http://localhost:3001`.

## Common Commands

```bash
bun run dev          # Start dev server
bun run build        # Production build
bun run lint         # ESLint

bun run db:migrate   # Run Prisma migrations
bun run db:seed      # Re-seed admin user
bun run db:studio    # Open Prisma Studio
```

## API Routes

All routes require an authenticated session.

| Method   | Path                              | Description                |
| -------- | --------------------------------- | -------------------------- |
| `GET`    | `/api/v1/hydra/clients`           | List OAuth2 clients        |
| `POST`   | `/api/v1/hydra/clients`           | Create an OAuth2 client    |
| `DELETE` | `/api/v1/hydra/clients/:id`       | Delete an OAuth2 client    |
| `POST`   | `/api/v1/hydra/tokens/introspect` | Introspect an access token |
