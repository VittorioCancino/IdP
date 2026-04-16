# IdP

Self-hosted Identity Provider built on [Ory Hydra](https://www.ory.sh/hydra/). Provides OAuth2/OIDC infrastructure for machine-to-machine authentication using the client credentials grant.

## Structure

```
IdP/
├── auth-server/
│   ├── compose.yml       # Hydra + PostgreSQL Docker stack
│   ├── hydra/            # Ory Hydra configuration
│   └── admin-web/        # Next.js admin console
└── resource-server/      # NestJS API (validates Hydra-issued tokens)
```

## Services

| Service        | Port  | Description                          |
|----------------|-------|--------------------------------------|
| Hydra public   | 4444  | OAuth2/OIDC endpoints                |
| Hydra admin    | 4445  | Admin API (localhost only)           |
| Admin web      | 3000  | Admin console (Next.js)              |
| Admin Postgres | 5433  | Admin web database                   |

## Getting Started

Start the Hydra stack first, then the admin console:

```bash
# 1. Hydra + its PostgreSQL
cd auth-server
cp .env.example .env   # fill in secrets
docker compose up -d

# 2. Admin web
cd admin-web
cp .env.example .env   # fill in secrets
./init.sh
```

See each subdirectory's README for detailed setup instructions.

## Components

- **[auth-server](auth-server/README.md)** — Ory Hydra OAuth2 server and Docker setup
- **[admin-web](auth-server/admin-web/README.md)** — Secured admin console for managing OAuth2 clients
- **resource-server** — NestJS API that accepts and validates Hydra-issued bearer tokens
