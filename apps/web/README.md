# KinetiQ web application

The KinetiQ web application is a Next.js App Router frontend for the fitness
platform. It provides the public exercise and muscle reference library,
authenticated routines, training programs, workout recording and history,
analytics, and the shared responsive application shell.

Route-specific UI lives under `src/app`, shared UI primitives and components
live under `src/components`, and frontend API clients/types live under `src/lib`
and `src/types`. Server Components are used for page orchestration where
appropriate; client components handle interactive forms, queries, and workout
recording. Frontend code consumes API contracts and does not import Prisma or
other backend internals.

## Local setup

From the repository root:

```bash
pnpm install
cp apps/web/.env.example apps/web/.env
pnpm dev:web
```

The web application runs at `http://localhost:3001`. The local environment
expects `NEXT_PUBLIC_API_URL=http://localhost:3000` and
`NEXT_PUBLIC_SITE_URL=http://localhost:3001`. For a production build,
`NEXT_PUBLIC_SITE_URL` must be set to the public application URL.

The API must be running separately for authenticated and data-backed pages.
Start it with `pnpm dev:api` after completing the API setup described in the
[API README](../api/README.md).

## Development and verification

```bash
pnpm --filter web dev
pnpm --filter web lint
pnpm --filter web typecheck
pnpm --filter web build
```

The root shortcuts `pnpm dev:web`, `pnpm lint:web`, and `pnpm build:web` are
also available. The production build requires a valid `NEXT_PUBLIC_SITE_URL`.

## Tests

Run the deterministic frontend suites with Vitest, React Testing Library, and
MSW:

```bash
pnpm --filter web test:unit
pnpm --filter web test:coverage
```

The browser suites are intentionally separate:

```bash
# Playwright journeys with mocked API responses
pnpm --filter web test:browser:mocked

# Playwright accessibility checks with axe-core
pnpm --filter web test:a11y

# Real API smoke tests when credentials are configured
pnpm --filter web test:smoke
```

The smoke suite uses `WEB_SMOKE_BASE_URL`, `WEB_SMOKE_EMAIL`, and
`WEB_SMOKE_PASSWORD`. CI runs deterministic suites on changes and enables the
real API smoke job only when its dedicated secrets and test database are
available.

## Images and local assets

Local exercise, muscle, and routine-cover assets are served from the public
directory and consumed through the shared image helpers. Missing images use
feature-specific fallbacks. The repository-local Sharp utility can report or
migrate supported raster assets:

```bash
pnpm optimize:images
pnpm optimize:images -- --benchmark
pnpm optimize:images -- --write
```

The optimizer is dry-run by default. See the root README and implementation
plan for deployment, media, and production-environment details.

## Further documentation

- [Project README](../../README.md)
- [Frontend architecture](../../docs/implementation-plan/18-frontend-architecture.md)
- [Implementation plan](../../docs/implementation-plan/README.md)
