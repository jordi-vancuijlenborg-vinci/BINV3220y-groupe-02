# Gesta repository guidelines

## Build, test, and lint

Use Node.js `>=22.14.0` (Node 24 LTS is recommended) and npm from the repository
root. Install the locked dependencies and initialize local configuration/data with:

```bash
npm ci
npm run setup
```

The main commands are:

```bash
npm run dev        # API on http://localhost:3000 and Vite app on http://localhost:5173
npm run lint       # Oxlint for both workspaces; warnings fail
npm run typecheck  # TypeScript checks for both workspaces
npm test           # Vitest suites for backend and frontend
npm run build      # Build both workspaces
npm run check      # lint, typecheck, tests, then build
```

Run a single test file by passing its path to the workspace script:

```bash
npm run test -w backend -- tests/offers.test.ts
npm run test -w frontend -- tests/OffersPage.test.tsx
```

Run a single Vitest test by adding `-t` and its test name:

```bash
npm run test -w backend -- tests/offers.test.ts -t "test name"
```

Use `npm run db:init` to apply migrations and seed an empty database. Use
`npm run db:reset` only after stopping the development server; it deletes and recreates
the local SQLite database.

## Architecture

This is an npm-workspaces monorepo with a React/Vite frontend and an Express/TypeScript
backend backed by a local SQLite database (`better-sqlite3`). In development, the
frontend calls `/api/...`; Vite proxies that path to the backend and removes `/api`.
See [docs/architecture.md](../docs/architecture.md) for the detailed diagrams and
reference feature paths, and [backend/API.md](../backend/API.md) for the HTTP contract.

The backend is assembled through factories in `app.ts`:

```text
HTTP route -> middleware -> controller -> service -> repository -> SQLite
                                      -> mapper -> API DTO
```

- Controllers parse/validate HTTP input and produce responses; they do not contain
  database queries or business rules.
- Services contain business rules and accept domain values, never Express
  `Request`/`Response` objects.
- Repositories contain SQL and return database row types (DBOs).
- Mappers convert between DBOs, domain models, and response DTOs.
- `authenticate` loads the current user from the token and database; named permission
  rules in `services/permissions.ts` are used by authorization middleware/services.
- Throw `HttpError` for expected failures. `errorHandler` is the single place that
  converts errors to `{ "error": { "code", "message" } }` responses.

The frontend follows the course's MVVM-style flow:

```text
pages -> hooks -> services/utils -> models
  \-> reusable components
```

`App.tsx` is the only caller of `useAuth`; it passes session state and logout handling
to pages. Frontend services use `readJson` with a type guard before returning API data.
Hooks own loading/error state, abort in-flight fetches on cleanup, and call
`onUnauthorized` for HTTP 401 responses.

## Repository-specific conventions

- Keep backend relative imports ending in `.ts`; the build rewrites them to `.js`.
- Send the session token directly as `Authorization: <token>`; do not add a `Bearer`
  prefix. The token only identifies `kind` and `id`; roles and company relationships
  are reread from the database on every request.
- Keep demo authentication local-only. It is enabled by `DEMO_AUTH_ENABLED=true` and
  must not be enabled with `NODE_ENV=production`. Never treat demo login as real
  authentication.
- Add schema changes as a new ordered file under `backend/src/db/migrations/`
  (`002_...sql`, etc.). Do not edit an already-applied migration.
- Keep SQL in repositories and use the existing `Db` prepared-statement helpers.
  Database constraints belong in SQLite; cross-record business rules belong in
  services.
- Backend status and role values are English codes (for example `PUBLISHED` and
  `DEPOSITOR`); translate them for display in frontend labels rather than changing
  API/database codes.
- Use stable identifiers from `backend/src/db/seed/seedIds.ts` in backend tests.
  Backend tests build a complete app over an isolated in-memory SQLite database via
  `backend/tests/helpers/testApp.ts`; do not use the development database in tests.
  Frontend tests use Vitest, jsdom, Testing Library, and the fetch mock helpers.
- Preserve the existing API error/status contract and authorization filtering when
  adding endpoints. A contact's roles apply across all companies attached to that
  contact, while access to company-scoped data must still respect those relationships.
- Keep environment and generated database files out of version control. Configure
  local values through `backend/.env` based on [backend/.env.example](../backend/.env.example).
