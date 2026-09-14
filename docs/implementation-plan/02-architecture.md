# Architecture

## Purpose and recommendation

Use a TypeScript monorepo containing a Next.js App Router web application and a NestJS modular-monolith API, backed by one PostgreSQL database. The closed beta deploys Next.js on Vercel, the Dockerized API behind Nginx on an Oracle Cloud VPS, and PostgreSQL on Neon. This is simpler to develop and operate than microservices while keeping browser, API, and database boundaries explicit.

## Current repository layout

```text
apps/
  web/                    # Next.js App Router
  api/                    # NestJS modules and Prisma access
deploy/                   # deployment runbook, environment template, Nginx template
docs/
  implementation-plan/
scripts/                  # repository utilities such as image optimization
```

Use pnpm workspaces and Turborepo only if task caching becomes useful; pnpm scripts alone are sufficient initially. Do not create `shared-types` or `validation` packages by default. Backend DTOs are the contract and OpenAPI generates client types. Sharing Prisma models or server-side Zod schemas with the browser creates coupling and can leak server assumptions. Share only stable, environment-neutral code with two real consumers.

## Runtime boundaries

```text
Browser
  │ HTTPS to kinetiq.reyslash.com
  ▼
Vercel Next.js ── same-origin /api rewrite ──► api.kinetiq.reyslash.com
                                                   │
                                              Nginx on Oracle VPS
                                                   │
                                                NestJS API
                                                   │
                                                 Prisma
                                                   │
                                             Neon PostgreSQL
```

Browser calls remain same-origin through the Vercel `/api` rewrite, while the
server-only `API_PROXY_URL` identifies the Oracle API origin. The API hostname
is independently reachable, so every protected route still relies on session,
role, and ownership authorization rather than CORS or the rewrite. Next.js must
not query PostgreSQL directly; NestJS remains the business-data authority.

## Current backend modules

- `ConfigModule`: validated environment configuration
- `SharedInfrastructureModule`: composed shared infrastructure boundary
- `SharedConfigModule`: validated environment configuration
- `SharedDatabaseModule`: Prisma client and transaction boundary
- `SharedAuthModule`: Better Auth request/session integration
- `MuscleGroupsModule`: public controlled muscle-group reads and admin writes
- `MusclesModule`: public controlled reference reads
- `ExercisesModule`: exercise identity and composed profile operations
- `RoutinesModule`: owned templates and prescriptions
- `HealthModule`: liveness/readiness
- `TrainingProgramsModule`: reusable multi-week templates and relative routine schedules
- `AdoptedTrainingProgramsModule`: owner-scoped adoption, occurrences, and progress
- `WorkoutSessionsModule`: standalone and program-origin workout execution/history
- `AnalyticsModule`: deterministic owner-scoped analytics reads

A `UsersModule` or `MediaModule` should be added only if post-beta requirements
justify application profile operations beyond Better Auth or managed-media
workflows beyond the current tracked assets.

Modules may share IDs and public service interfaces, but should not reach into one another’s Prisma repositories. Cross-aggregate writes (for example exercise plus muscle assignments and profiles) are coordinated by one application service in one transaction.

## Feature-local Clean Architecture

`TrainingProgramsModule` began as the isolated pilot for lean Clean
Architecture/DDD inside the modular monolith. The current `routines` and
`training-programs` modules now both use the approved feature-local layers,
command/query ports, and Prisma adapters. Other current modules have also been
migrated deliberately; this remains a modular monolith, not a microservice or a
reason to add generic framework abstractions.

Layered modules use feature ownership first and layers inside the feature:

```text
apps/api/src/modules/training-programs/
  domain/
    entities/
    errors/
  application/
    ports/
    use-cases/
      commands/
      queries/
    models/
  infrastructure/
    prisma/
  presentation/
    dto/
  training-programs.module.ts
```

Dependency direction is inward:

```text
presentation ──> application ──> domain
                         ▲
                         │ implements ports
infrastructure ──────────┘
```

- **Domain** owns the `TrainingProgram` aggregate, schedule-entry behavior, invariants, and domain errors. It imports no NestJS, Prisma, Swagger, class-validator, or HTTP types.
- **Application** owns use-case orchestration, command/query ports, and transport-neutral input/output models. It depends on the domain, not concrete persistence.
- **Infrastructure** implements feature-specific repository ports with Prisma, maps database rows to domain/application models, and owns atomic persistence details.
- **Presentation** owns NestJS controllers, authentication decorators, HTTP request/response DTOs, Swagger annotations, and translation from application/domain errors to the established HTTP contract.
- **Module composition** binds repository tokens to Prisma implementations and wires use cases/controllers.

Keep layered feature modules lean:

- The current shared domain kernel contains `Entity`, the base `ValueObject`,
  generated `UniqueId`, and validated `ExistingUuid`. Do not add generic
  repositories, use cases, result wrappers, event buses, or a CQRS dependency.
- Introduce a value object only when it centralizes validation or protects a
  meaningful invariant/behavior; do not wrap primitives solely to increase file
  count.
- Repository methods are aggregate/use-case specific and preserve ownership and transaction guarantees; do not expose generic unscoped CRUD.
- Prisma types and generated enums do not cross the infrastructure boundary.
- Shared database, authentication, and configuration infrastructure lives under `modules/shared/infrastructure`; feature modules import focused shared modules explicitly, while `AppModule` composes them through `SharedInfrastructureModule`.
- Cross-feature access uses narrow ports or feature-owned repository operations; a module never imports another feature’s Prisma implementation.

Phase 8 should use the same boundary under
`apps/api/src/modules/workout-sessions/`. Its command side mutates the owned
`WorkoutSession` aggregate; its query side may return specialized historical
read models. See [workout sessions](14-workout-sessions.md) for the intended
module shape and scope.

## Frontend architecture

Use server components for public, read-oriented page shells and metadata where useful. Use client components for TanStack Query interactions, filters, forms, ordering, and authenticated mutations. Route groups should separate public library, authenticated app, and admin surfaces. React Hook Form plus Zod handles immediate browser feedback; Nest DTO validation remains authoritative.

## Request flow

1. Nginx terminates HTTPS and proxies based on path.
2. Better Auth session cookies are secure, HTTP-only, and same-site.
3. NestJS resolves the authenticated principal and role.
4. Controllers validate DTOs and delegate to explicit application use cases in layered feature modules or focused services in unmigrated modules.
5. Services/use cases enforce domain rules and query-level ownership through feature contracts.
6. Prisma executes constrained reads/writes behind feature adapters in layered modules or directly in focused legacy services, using transactions for aggregate changes.
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

Stateless web/API runtimes can later scale horizontally because sessions and the database are external. CPU-heavy image transformation and managed-media asset management are post-MVP concerns; the MVP does not process image uploads.

## Testing and definition of done

- Architecture checks prevent the web app importing Prisma/server modules.
- API boots against a clean migrated database.
- Web/API production builds run in containers as non-root users.
- The Vercel web health route responds, and a request through the Oracle Nginx proxy reaches `/api/health/ready`.
- Configuration startup fails clearly when a required variable is absent.
- OpenAPI output is generated and checked for unexpected changes.

## Future extensions

A worker process, cache, queue, or read model is added only after measurements justify it. The modular boundaries above provide extraction points without pre-building distributed infrastructure.
