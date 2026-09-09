# KinetiQ API

The KinetiQ API is the NestJS backend for the fitness platform. It owns
authentication integration, authorization and ownership checks, domain
validation, Prisma persistence, workout history, adopted training-program
execution, and read-only analytics.

Feature code is organized under `src/modules`. The API uses Prisma with
PostgreSQL, Better Auth for identity/session integration, and DTOs for HTTP
validation and OpenAPI documentation. Frontend code consumes API contracts and
does not depend on Prisma models or backend internals.

## Local setup

From the repository root:

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
docker compose up -d postgres
pnpm --filter api prisma:migrate:dev
pnpm --filter api prisma:seed
pnpm dev:api
```

The API listens on `http://localhost:3000`. Its global API prefix is `/api`.
The readiness endpoint is `GET /api/health`, and development Swagger is
available at `http://localhost:3000/api/docs`.

The local environment file requires a PostgreSQL `DATABASE_URL`, Better Auth
configuration, the frontend origin, and the other values described in
`apps/api/.env.example`. Never commit a populated environment file or live
credentials.

## Prisma commands

Run these from the repository root:

```bash
pnpm --filter api prisma:generate
pnpm --filter api prisma:migrate:dev
pnpm --filter api prisma:migrate:deploy
pnpm --filter api prisma:seed
pnpm --filter api prisma:studio
```

Use `prisma:migrate:dev` for local schema development and
`prisma:migrate:deploy` for an already-created database in CI or deployment.
Seeds are curated development/reference data and should not be treated as a
production data reset.

## Development and production commands

```bash
pnpm --filter api start:dev
pnpm --filter api build
pnpm --filter api start:prod
pnpm --filter api lint
pnpm --filter api typecheck
```

The root `pnpm dev:api` command is the preferred local watch-mode shortcut.

## Tests

```bash
# API unit tests
pnpm --filter api test

# Unit tests with coverage
pnpm --filter api test:cov

# PostgreSQL-backed E2E tests
pnpm --filter api test:e2e:db:up
cp apps/api/.env.test.example apps/api/.env.test
pnpm --filter api test:e2e
pnpm --filter api test:e2e:db:down

# Mutation testing
pnpm --filter api test:mutation
pnpm --filter api test:mutation:analytics
```

The E2E setup uses a disposable PostgreSQL database named `kinetiq_test` and
rejects database URLs that do not clearly identify a test database. Keep the
test database separate from local development data.

The root deterministic check also runs the API unit suite, web unit suite, and
image-script tests. Browser, accessibility, smoke, E2E, and mutation suites
remain explicit heavier checks and are run by their corresponding CI jobs.

## API boundaries

Authenticated resources use the request principal as the owner identity;
clients must not supply an arbitrary owner ID. Prisma queries enforce
ownership at the persistence boundary. Related operations that must succeed or
fail together use database transactions, while historical workout records
retain the snapshots needed for later reads and analytics.

For the broader product scope, architecture, deployment, and contribution
workflow, see the [root README](../../README.md) and the
[implementation plan](../../docs/implementation-plan/README.md).
