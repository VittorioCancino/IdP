# Hydra Auth Server

This directory contains a minimal self-hosted `Ory Hydra` setup for local development, separated from the Nest resource server.

It follows Ory's self-hosted Docker installation and quickstart model:

- Hydra runs as the OAuth2/OIDC authorization server.
- PostgreSQL stores Hydra's own OAuth state.
- The resource server remains a separate service with its own data model and database.

Reference docs:

- Installation: https://www.ory.com/docs/hydra/self-hosted/install
- Quickstart: https://www.ory.com/docs/hydra/self-hosted/quickstart

## What Is In Here

- `compose.yml`: local `Postgres + Hydra` stack
- `hydra/hydra.yml`: small Hydra config file
- `.env.example`: local environment template

For now, this setup is intentionally aimed at `machine-to-machine` flows first. We are not adding login/consent URLs yet, because those are only needed once we wire in human-user flows.

## Important Security Note

Ory's docs warn that the open-source server APIs do not come with integrated access control by default. For local development, both ports are bound to `127.0.0.1`. In a real deployment, keep the admin API private and put public exposure behind a gateway or reverse proxy.

## Boot The Stack

1. Copy the environment template:

```bash
cp .env.example .env
```

2. Start PostgreSQL:

```bash
docker compose up -d postgres
```

3. Run Hydra database migrations:

```bash
docker compose run --rm hydra migrate sql up -e --yes --config /etc/config/hydra/hydra.yml
```

4. Start Hydra:

```bash
docker compose up -d hydra
```

5. Check readiness:

```bash
curl http://127.0.0.1:4444/health/ready
curl http://127.0.0.1:4445/health/ready
```

## Register A Machine Client

Create a client that can use the `client_credentials` grant:

```bash
docker compose exec hydra \
  hydra create client \
  --endpoint http://127.0.0.1:4445/ \
  --grant-type client_credentials \
  --scope api.read
```

That command returns a `client_id` and `client_secret`. Use them to fetch a token:

```bash
docker compose exec hydra \
  hydra perform client-credentials \
  --endpoint http://127.0.0.1:4444/ \
  --client-id <client_id> \
  --client-secret <client_secret> \
  --scope api.read
```

At that point, Hydra is acting as a standalone authorization server for M2M.

## Where Nest Fits Later

The Nest `resource-server` will be a separate API that:

- receives bearer tokens from clients
- validates or introspects Hydra-issued access tokens
- applies its own authorization logic against its own data

If we later add human login, we will introduce another app or module that handles login and consent and connects Hydra to a user database.
