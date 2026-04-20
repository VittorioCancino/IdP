<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Repository Guidelines

## Project Purpose

This is the **auth-admin-panel** — a secured proxy layer on top of Ory Hydra's admin API (`localhost:4445`). It serves two purposes:

1. **Auth gate** — Hydra's admin API has no built-in authentication. This app wraps every Hydra admin operation behind a NextAuth.js credential login so only authenticated admins can reach those endpoints.
2. **GUI** — A web interface for managing OAuth2 clients and other Hydra resources.

The Hydra admin API is never exposed directly. All access flows through authenticated Next.js API routes.

## Project Structure & Module Organization

- `app/`: Next.js App Router routes, layouts, and API endpoints.
- `app/api/v1/`: REST API routes. All protected routes must check session via `auth()` before proxying to Hydra.
- `app/generated/prisma/`: Generated Prisma client — never edit manually.
- `components/`: Shared UI components.
- `lib/auth/`: Authentication helpers and auth-specific utilities.
- `lib/api/`: Client-side API caller layer. Keep shared transport and error helpers in `lib/api/client.ts`. Place per-resource API call functions in dedicated files (e.g., `lib/api/hydra-clients.ts`).
- `lib/db/`: Server-only database access modules backed by Prisma. Mark each file with `"server-only"`.
- `lib/hydra/`: Wrappers around Ory Hydra admin API calls. All raw `fetch` calls to Hydra live here — never scatter them across routes or components.
- `lib/const/`: Shared constants grouped by domain.
- `lib/types/`: Zod schemas and inferred TypeScript types for all API request/response contracts.
- `lib/util/`: General-purpose utilities — error builders, response helpers, and other shared helpers.
- `lib/prisma.ts`: Shared Prisma client entry point.
- `prisma/`: Database schema and migrations (`schema.prisma` is authoritative).
- `public/`: Static assets.

## Build, Test, and Development Commands

- `bun install`: Install dependencies and generate Prisma client.
- `bun run dev`: Start local server (`http://localhost:3000`).
- `bun run build` / `bun run start`: Build and run production.
- `bun run lint`: Run ESLint.
- `docker compose -f ../auth-server/compose.yml up -d`: Start Hydra + its PostgreSQL.
- `docker compose up -d postgres`: Start auth-admin-panel PostgreSQL (port 5433).
- `bun run db:migrate`, `bun run db:seed`, `bun run db:studio`: Prisma DB workflows.

## Architecture Patterns — Enforce These Everywhere

### Result Pattern (`ts-results`)

All async operations that can fail must return `Result<T, E>` from `ts-results` — never throw or return `null`.

```typescript
import { Ok, Err, Result } from "ts-results";

// DB layer
export async function findAdminUserByEmail(
  email: string,
): Promise<Result<AdminUser, DbError>> {
  return safeDbCall(async () => {
    return await prisma.adminUser.findUniqueOrThrow({ where: { email } });
  });
}

// API client layer
export const listHydraClients = async (): Promise<
  ApiResult<HydraClientSummary[]>
> => {
  return handleErrorResponse<HydraClientSummary[]>(
    apiFetch("/api/v1/hydra/clients", { credentials: "include" }),
    { returnBody: true },
  );
};
```

### Database Layer (`lib/db/`)

- Every file must start with `'server-only'`.
- All query functions must wrap Prisma calls in `safeDbCall()` from `lib/util/db.ts`.
- Return `Promise<Result<T, DbError>>` — never throw, never return `null`.
- Map Prisma model types to domain types explicitly when needed.

### API Client Layer (`lib/api/`)

- `lib/api/client.ts` owns: `apiFetch()`, `handleErrorResponse()`, `BaseError` enum, `ApiResult<T>` type.
- Per-resource files (e.g., `lib/api/hydra-clients.ts`) call `apiFetch` + `handleErrorResponse` and return `Promise<ApiResult<T>>`.
- For authenticated calls, validate token first and return `Err({ type: BaseError.MissingToken, ... })` before making the request.
- Never call `fetch` directly from UI components or pages.

### Type Contracts (`lib/types/`)

- Every API route that accepts a JSON body must have a Zod schema in the matching `lib/types/*.types.ts` file.
- Export the inferred payload type: `export type CreateHydraClientBody = z.infer<typeof CreateHydraClientBodySchema>`.
- Response types also live in `lib/types/` — not inside `route.ts` or `lib/api/*`.
- Both the route handler and the API client must import schema and types from `lib/types/`.

### Error Handling (`lib/util/api.ts`)

- Define and use shared error builders: `unauthorizedError`, `validationError`, `fromZodError`, `customError`, `internalServerError`, `notFoundError`.
- API route error responses must be typed as `ApiError` from `lib/types/api.types.ts`.
- Shape: `ApiError { message: string; errors?: Record<string, string[]> }`.
- Route handler return types must be explicit: `Promise<NextResponse<ApiError> | NextResponse<T>>`.
- Never manually construct `{ message: '...' }` error objects — use the shared builders.

### Validation

- Validate every input surface with Zod: request body, query string, and path params.
- Use `.safeParse()` in route handlers and return `fromZodError(result.error)` on failure.
- Never manually cast or trust unchecked payloads.

### Hydra Layer (`lib/hydra/`)

- All calls to the Hydra admin API (`HYDRA_ADMIN_URL`) live exclusively here.
- These are server-side only — mark files with `'server-only'`.
- Return `Result<T, HydraError>` or throw — route handlers decide what to surface to the client.

## Coding Style

- TypeScript strict mode; favor small typed modules.
- Before starting code changes, review `eslint.config.mjs` and write code to comply with current ESLint rules.
- Prefer `interface` over `type` for object shapes; use `type` aliases only when an interface cannot express the shape cleanly.
- Prettier: 2 spaces, single quotes, semicolons, trailing commas, width 80.
- No `any` — use proper types or `unknown` with narrowing.
- Use type-only imports: `import type { Foo } from '...'`.
- Naming: `PascalCase` components, lowercase route folders, `camelCase` utilities.
- Prefer the configured import alias `@/*` instead of long relative paths.
- Keep new shared code in the correct `lib/` subdirectory — do not add unrelated helpers to a generic module.
- Do not write comments that summarize what the code does. Comments explain _why_ only when the reason is non-obvious.

## Security

- Every API route under `app/api/v1/` must verify the session via `auth()` before proxying to Hydra — no exceptions.
- The Hydra admin API (`localhost:4445`) must never be called from client-side code.
- Never commit secrets; copy `.env.example` to `.env`.
- Passwords are hashed with bcryptjs (cost 12) — do not change the cost factor without reason.

## Hydra Layer Specifics

- Hydra returns `null` for empty arrays in responses — all array fields in Hydra response schemas must use `nullableArray` from `lib/types/hydra-client.types.ts` (a `z.preprocess` that coerces `null` → `[]`).
- Hydra returns 204 No Content on DELETE — do not attempt to parse the response body.
- Hydra returns 409 when a `client_id` already exists — route handlers must detect `err.isHttpError && err.status === 409` and return `alreadyExistsError('client_id')` with status 409.
- Hydra error bodies use the `error` field (not `message`) — `hydraFetch` in `lib/hydra/admin-client.ts` reads `body.error` for the message when a request fails.

## Dev Auth Bypass

`lib/util/dev.ts` exports `isAuthBypassed()` — returns `true` when `DEV_BYPASS_AUTH=true` is set in `.env` AND `NODE_ENV !== 'production'`. Use this to skip session checks during local testing with curl.

Every usage site must be marked with `// ⚠️  TODO: REMOVE BEFORE PRODUCTION` on the import and on each call site. The production guard in `isAuthBypassed()` is a hard stop, but the TODO comments are the signal for cleanup before deploy.

## UI/UX Patterns

- **Scope input**: `ScopeInput` component (`components/ScopeInput.tsx`) — tag-style input that stores a space-separated string in a hidden `<input name="scope">`. Hydra default scopes (`offline_access`, `offline`, `openid`) are pre-filled in muted grey so admins can remove them intentionally.
- **Form error handling**: store the full `ApiError` (not just `message`) in component state. Show field-level errors inline below each input with a red border on the field. Show a general error banner only for errors that are not already expressed as field errors. Use `isSubmitting` boolean instead of a separate loading state — this keeps the form mounted so field values are preserved on error.
- **Delete confirmation**: GitHub-style modal (`components/DeleteClientModal.tsx`) — user must type the client name (or ID if no name) exactly to enable the confirm button. Escape and backdrop click cancel.
- **Optimistic updates**: on successful delete, filter the client out of local state immediately — no page reload. Stats cards must be derived from the same state as the table so they update together. Use a single client component (`ClientsDashboard`) that owns both.
- **One-time secret display**: after client creation, show credentials in an amber-highlighted card with copy buttons. Never redirect away from the secret — keep it in React state and only navigate on explicit "Go to Clients" action.

## Implemented Features (as of 2026-04-15)

- Admin login (NextAuth.js credentials, JWT session)
- OAuth2 client list with stats (total / machine / public)
- OAuth2 client creation with scope tag input and one-time secret display
- OAuth2 client deletion with GitHub-style typed confirmation modal and optimistic UI updates

## Pending / Not Yet Implemented

- Client View and Edit (buttons exist in the table but are not wired up)
- Resource server (`resource-server/`) — NestJS starter, no logic yet

## Commit Guidelines

- Branches: `feature/<short-description>`, `fix/<short-description>`.
- Keep commits small and imperative (e.g., `hydra: add client delete endpoint`).

## Other

- Check the readme for setup and run instructions.
- This project does not have automated tests yet — do not introduce a test runner unless explicitly asked.
