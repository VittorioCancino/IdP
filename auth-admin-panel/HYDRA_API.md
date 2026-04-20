# Ory Hydra Admin API — Endpoint Registry

Reference for all Hydra admin API endpoints. Updated as features are implemented.

---

## OAuth2 Clients

| Method   | Path                            | Wrapped | Notes                                        |
| -------- | ------------------------------- | ------- | -------------------------------------------- |
| `GET`    | `/admin/clients`                | ✅      | List all clients                             |
| `POST`   | `/admin/clients`                | ✅      | Create client — secret generated server-side |
| `GET`    | `/admin/clients/{id}`           | ✅      | Get client detail                            |
| `PUT`    | `/admin/clients/{id}`           | ✅      | Update client fields                         |
| `PATCH`  | `/admin/clients/{id}`           | ✅      | Secret rotation via JSON Patch               |
| `DELETE` | `/admin/clients/{id}`           | ✅      | Delete client                                |
| `PUT`    | `/admin/clients/{id}/lifespans` | ❌      | Per-client token lifespan overrides — future |

---

## OAuth2 Tokens

| Method   | Path                                         | Wrapped | Notes                                          |
| -------- | -------------------------------------------- | ------- | ---------------------------------------------- |
| `POST`   | `/admin/oauth2/introspect`                   | ✅      | Validate and inspect a token                   |
| `DELETE` | `/admin/oauth2/tokens`                       | ✅      | Revoke all tokens for a client (`?client_id=`) |
| `GET`    | `/admin/oauth2/auth/sessions/consent`        | ❌      | Not relevant for M2M                           |
| `DELETE` | `/admin/oauth2/auth/sessions/consent`        | ❌      | Not relevant for M2M                           |
| `DELETE` | `/admin/oauth2/auth/sessions/login`          | ❌      | Not relevant for M2M                           |
| `GET`    | `/admin/oauth2/auth/requests/login`          | ❌      | Not relevant for M2M                           |
| `PUT`    | `/admin/oauth2/auth/requests/login/accept`   | ❌      | Not relevant for M2M                           |
| `PUT`    | `/admin/oauth2/auth/requests/login/reject`   | ❌      | Not relevant for M2M                           |
| `GET`    | `/admin/oauth2/auth/requests/consent`        | ❌      | Not relevant for M2M                           |
| `PUT`    | `/admin/oauth2/auth/requests/consent/accept` | ❌      | Not relevant for M2M                           |
| `PUT`    | `/admin/oauth2/auth/requests/consent/reject` | ❌      | Not relevant for M2M                           |
| `GET`    | `/admin/oauth2/auth/requests/logout`         | ❌      | Not relevant for M2M                           |
| `PUT`    | `/admin/oauth2/auth/requests/logout/accept`  | ❌      | Not relevant for M2M                           |
| `PUT`    | `/admin/oauth2/auth/requests/logout/reject`  | ❌      | Not relevant for M2M                           |

> The login/consent/logout request flows are only needed for the Authorization Code flow
> with a login UI. They have no role in client credentials (M2M) flows.

---

## JSON Web Keys

| Method   | Path                      | Wrapped | Notes                                      |
| -------- | ------------------------- | ------- | ------------------------------------------ |
| `GET`    | `/admin/keys/{set}`       | ❌      | Future — if private_key_jwt auth is needed |
| `POST`   | `/admin/keys/{set}`       | ❌      | Future                                     |
| `PUT`    | `/admin/keys/{set}`       | ❌      | Future                                     |
| `DELETE` | `/admin/keys/{set}`       | ❌      | Future                                     |
| `GET`    | `/admin/keys/{set}/{kid}` | ❌      | Future                                     |
| `PUT`    | `/admin/keys/{set}/{kid}` | ❌      | Future                                     |
| `DELETE` | `/admin/keys/{set}/{kid}` | ❌      | Future                                     |

---

## Trusted JWT Bearer Grants

| Method   | Path                                          | Wrapped | Notes  |
| -------- | --------------------------------------------- | ------- | ------ |
| `GET`    | `/admin/trust/grants/jwt-bearer/issuers`      | ❌      | Future |
| `POST`   | `/admin/trust/grants/jwt-bearer/issuers`      | ❌      | Future |
| `GET`    | `/admin/trust/grants/jwt-bearer/issuers/{id}` | ❌      | Future |
| `DELETE` | `/admin/trust/grants/jwt-bearer/issuers/{id}` | ❌      | Future |

---

## Public Endpoints (Hydra — no admin auth)

These are called directly by clients or browsers. They are not wrapped by auth-admin-panel.

| Method | Path                                | Notes                                     |
| ------ | ----------------------------------- | ----------------------------------------- |
| `POST` | `/oauth2/token`                     | Clients call this to obtain access tokens |
| `POST` | `/oauth2/revoke`                    | Clients self-revoke their own tokens      |
| `GET`  | `/oauth2/auth`                      | Authorization Code flow entry point       |
| `GET`  | `/.well-known/openid-configuration` | OIDC discovery document                   |
| `GET`  | `/.well-known/jwks.json`            | Public signing keys                       |
| `GET`  | `/userinfo`                         | OIDC userinfo endpoint                    |
| `GET`  | `/health/alive`                     | Liveness check                            |
| `GET`  | `/health/ready`                     | Readiness check                           |
| `GET`  | `/version`                          | Hydra version info                        |

---

## Current Status

All endpoints relevant to **M2M client credentials flow** are wrapped. Future work will be
driven by new feature requirements — implement endpoints as needed, not speculatively.
