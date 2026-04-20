# IdP

Self-hosted Identity Provider built on [Ory Hydra](https://www.ory.sh/hydra/). Provides OAuth2/OIDC infrastructure for machine-to-machine authentication using the client credentials grant.

## Structure

```
IdP/
├── auth-server/
│   ├── compose.yml        # Hydra + PostgreSQL Docker stack
│   └── hydra/             # Ory Hydra configuration
├── auth-admin-panel/      # Next.js admin console
└── resource-server/       # NestJS API (validates Hydra-issued tokens)
```

## Services

| Service             | Port | Description                |
| ------------------- | ---- | -------------------------- |
| Resource server     | 3000 | NestJS protected API       |
| Auth admin panel    | 3001 | Admin console (Next.js)    |
| Hydra public        | 4444 | OAuth2/OIDC endpoints      |
| Hydra admin         | 4445 | Admin API (localhost only) |
| Hydra Postgres      | 5432 | Hydra database             |
| Auth admin Postgres | 5433 | Admin panel database       |
| Resource server DB  | 5434 | Resource server database   |

## Getting Started

Run services standalone with each app bootstrapper:

```bash
# 1. Hydra + its PostgreSQL
cd auth-server
cp .env.example .env   # fill in secrets
./init.sh

# 2. Admin panel
cd ../auth-admin-panel
cp .env.example .env   # fill in secrets
./init.sh

# 3. Resource server
cd ../resource-server
cp .env.example .env
./init.sh
```

See each subdirectory's README for detailed setup instructions.

## Docker Orchestration

To run the whole platform together with shared Docker networks:

```bash
cp .env.example .env
./main-init.sh
```

The root compose file uses:

- `idp_private` for internal service-to-service traffic
- `idp_public` for services that expose host ports

Inside the Docker network, both `auth-admin-panel` and `resource-server` talk to Hydra via `http://hydra:4445`.

## Components

- **[auth-server](auth-server/README.md)** — Ory Hydra OAuth2 server and Docker setup
- **[auth-admin-panel](auth-admin-panel/README.md)** — Secured admin console for managing OAuth2 clients
- **resource-server** — NestJS API that accepts and validates Hydra-issued bearer tokens
