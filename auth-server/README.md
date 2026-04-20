# Auth Server

Ory Hydra OAuth2/OIDC server for machine-to-machine authentication. Hydra's admin API has no built-in access control — the separate [auth-admin-panel](../auth-admin-panel/README.md) console sits in front of it and requires an authenticated session for all admin operations.

## What's Here

- `compose.yml` — PostgreSQL + Hydra Docker stack
- `hydra/hydra.yml` — Hydra configuration

## Ports

| Service        | Port | Bound to  |
| -------------- | ---- | --------- |
| Hydra public   | 4444 | 127.0.0.1 |
| Hydra admin    | 4445 | 127.0.0.1 |
| Hydra Postgres | 5432 | 127.0.0.1 |

> The admin port (`4445`) is bound to localhost only. Never expose it publicly.

## Setup

1. Copy and fill in the environment file:

```bash
cp .env.example .env
```

| Variable              | Description                                                 |
| --------------------- | ----------------------------------------------------------- |
| `HYDRA_SYSTEM_SECRET` | Secret for signing internal tokens — `openssl rand -hex 32` |
| `POSTGRES_PASSWORD`   | Password for Hydra's PostgreSQL                             |

2. Bootstrap the standalone Hydra service:

```bash
./init.sh
```

3. Verify readiness:

```bash
curl http://127.0.0.1:4444/health/ready
curl http://127.0.0.1:4445/health/ready
```

## Creating a Machine Client (CLI)

You can create clients directly via the Hydra CLI. The admin console provides a GUI for the same operations.

```bash
docker compose exec hydra \
  hydra create client \
  --endpoint http://127.0.0.1:4445/ \
  --grant-type client_credentials \
  --scope api.read
```

Fetch a token with the returned credentials:

```bash
docker compose exec hydra \
  hydra perform client-credentials \
  --endpoint http://127.0.0.1:4444/ \
  --client-id <client_id> \
  --client-secret <client_secret> \
  --scope api.read
```

## References

- [Ory Hydra self-hosted install](https://www.ory.sh/docs/hydra/self-hosted/install)
- [Ory Hydra quickstart](https://www.ory.sh/docs/hydra/self-hosted/quickstart)
