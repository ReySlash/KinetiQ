# Architecture

## Purpose and recommendation

Use a TypeScript monorepo containing a Next.js App Router web application and a NestJS modular-monolith API, backed by one PostgreSQL database. Deploy them as separate containers behind Nginx. This is simpler to develop and operate than microservices while keeping browser, API, worker, and storage boundaries explicit.

## Suggested repository layout

```text
apps/
  web/                    # Next.js App Router
  api/                    # NestJS modules and Prisma access
packages/
  eslint-config/          # shared tooling only
  tsconfig/               # shared compiler baselines
  api-client/             # generated OpenAPI client/types (when introduced)
infra/
  docker/
  nginx/
  scripts/
docs/
  implementation-plan/
```

Use pnpm workspaces and Turborepo only if task caching becomes useful; pnpm scripts alone are sufficient initially. Do not create `shared-types` or `validation` packages by default. Backend DTOs are the contract and OpenAPI generates client types. Sharing Prisma models or server-side Zod schemas with the browser creates coupling and can leak server assumptions. Share only stable, environment-neutral code with two real consumers.

## Runtime boundaries

```text
Browser
  │ HTTPS
  ▼
Nginx ───── /api/v1/* ───► NestJS API ───► Prisma ───► PostgreSQL
  │                           │
  └──── all other paths ─► Next.js        └──────────► StorageService
                                                       ├─ local dev files
                                                       └─ S3-compatible objects
```

Prefer same-site deployment (`app.example.com` with `/api` proxying) to simplify cookies, CORS, and CSRF posture. Next.js renders pages and owns browser interaction; it must not directly query PostgreSQL. NestJS is the only business-data authority.

## Backend modules

- `ConfigModule`: validated environment configuration
- `PrismaModule`: database client and transaction boundary
- `AuthModule`: Better Auth request/session integration
- `UsersModule`: minimal application user/profile and roles
- `MusclesModule`: public controlled reference reads
- `ExercisesModule`: exercise identity and composed profile operations
- `MediaModule`: upload policy and `StorageService`
- `RoutinesModule`: owned templates and prescriptions
- `HealthModule`: liveness/readiness
- Later: `TrainingPlansModule`, `WorkoutSessionsModule`, `AnalyticsModule`

Modules may share IDs and public service interfaces, but should not reach into one another’s Prisma repositories. Cross-aggregate writes (for example exercise plus muscle assignments and profiles) are coordinated by one application service in one transaction.

## Frontend architecture

Use server components for public, read-oriented page shells and metadata where useful. Use client components for TanStack Query interactions, filters, forms, ordering, and authenticated mutations. Route groups should separate public library, authenticated app, and admin surfaces. React Hook Form plus Zod handles immediate browser feedback; Nest DTO validation remains authoritative.

## Request flow

1. Nginx terminates HTTPS and proxies based on path.
2. Better Auth session cookies are secure, HTTP-only, and same-site.
3. NestJS resolves the authenticated principal and role.
4. Controllers validate DTOs and delegate to application services.
5. Services enforce domain rules and query-level ownership.
6. Prisma executes constrained reads/writes, using transactions for aggregate changes.
7. A global exception filter returns the standard problem response with a request ID.

## Alternatives considered

### Next.js as the only backend

It reduces components but conflicts with the required NestJS backend and makes later API consumers less clean. Rejected.

### Microservices

They add deployment, transactions, observability, and contract overhead without independent scaling needs. Rejected until proven necessary.

### GraphQL

The domain can be served cleanly by resource-oriented REST, and OpenAPI provides a usable typed client. REST is recommended for MVP.

### Shared validation package

It can reduce duplicated rules but makes API evolution and browser bundles dependent on server code. Start with generated contracts and deliberately duplicate presentation validation; extract only stable primitives such as the score range if repetition becomes costly.

## Environment separation

Use `.env.example` files without secrets and validate every environment at startup. Development, test, staging, and production need separate databases, Better Auth secrets, origins, and storage buckets/prefixes. Tests must never infer or reuse the development database URL.

## Scalability posture

Stateless web/API containers can later scale horizontally if sessions and media are external. CPU-heavy image transformation should eventually move to a background job, but synchronous thumbnail processing is acceptable for small admin-only MVP uploads with strict limits.

## Testing and definition of done

- Architecture checks prevent the web app importing Prisma/server modules.
- API boots against a clean migrated database.
- Web/API production builds run in containers as non-root users.
- A request through Nginx reaches both the web and `/api/v1/health/ready`.
- Configuration startup fails clearly when a required variable is absent.
- OpenAPI output is generated and checked for unexpected changes.

## Future extensions

A worker process, cache, queue, or read model is added only after measurements justify it. The modular boundaries above provide extraction points without pre-building distributed infrastructure.

