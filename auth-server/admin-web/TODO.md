# TODO — Admin Web Roadmap

## Client View

- [ ] Wire up "View" button in clients table (`/admin/clients/[clientId]`)
- [ ] Fetch client detail via `GET /api/v1/hydra/clients/[clientId]`
- [ ] Add `getHydraClient(clientId)` to `admin-client.ts` (`GET /admin/clients/{id}`)
- [ ] Add route handler `src/app/api/v1/hydra/clients/[clientId]/route.ts` — `GET` handler
- [ ] Add `getHydraClient` to `src/lib/api/hydra-clients.ts` (client-side caller)
- [ ] Display: client ID, name, scopes, grant types, auth method, redirect URIs, created date, audience
- [ ] Link back to client list

## Client Edit

- [ ] Wire up "Edit" button in clients table (`/admin/clients/[clientId]/edit`)
- [ ] Add `updateHydraClient(clientId, body)` to `admin-client.ts` (`PUT /admin/clients/{id}`)
- [ ] Add route handler — `PUT /api/v1/hydra/clients/[clientId]`
- [ ] Add client-side caller to `hydra-clients.ts`
- [ ] Edit form: name, scopes (reuse `ScopeInput`), token endpoint auth method
- [ ] Preserve non-editable fields (client_id, grant_types) in the PUT body
- [ ] Show success confirmation after save

## Secret Rotation

- [ ] Add "Rotate Secret" action on Client View or Edit page
- [ ] Add `rotateHydraClientSecret(clientId)` to `admin-client.ts` (`POST /admin/clients/{id}/rotate-secret`)
- [ ] Add route handler `POST /api/v1/hydra/clients/[clientId]/rotate-secret`
- [ ] Show one-time secret display card (same pattern as create) after rotation
- [ ] Confirm modal before rotating ("This will invalidate the current secret")

## Token Management (future)

- [ ] List active tokens per client — requires Hydra consent/session API or custom tracking
- [ ] Revoke a specific token — `DELETE /admin/oauth2/token` or `POST /admin/oauth2/revoke`
- [ ] Add revoke action to token introspect result page (if token is active)

## Production Hardening

- [ ] Remove `DEV_BYPASS_AUTH` env flag and all call sites:
  - `src/lib/util/dev.ts` — delete file
  - `src/app/api/v1/hydra/clients/route.ts` — remove bypass block
  - `src/app/api/v1/hydra/clients/[clientId]/route.ts` — remove bypass block
  - `src/app/api/v1/hydra/tokens/introspect/route.ts` — remove bypass block
- [ ] Final build verification (`pnpm build` with no errors)
- [ ] Review all `// TODO` comments in source

## Nice to Have

- [ ] Pagination for client list (Hydra supports `page_size` / `page_token`)
- [ ] Search/filter clients by name or ID
- [ ] Copy-to-clipboard button for client ID and token values
- [ ] Audit log or last-used timestamps (would require external tracking)
