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
Nginx ───── /api/* ───► NestJS API ───► Prisma ───► PostgreSQL
  │                           │
  └──── all other paths ─► Next.js        └──────────► StorageService
                                                       ├─ local dev files
                                                       └─ S3-compatible objects
```

Prefer same-site deployment (`app.example.com` with `/api` proxying) to simplify cookies, CORS, and CSRF posture. Next.js renders pages and owns browser interaction; it must not directly query PostgreSQL. NestJS is the only business-data authority.

## Backend modules

- `ConfigModule`: validated environment configuration
- `SharedInfrastructureModule`: composed shared infrastructure boundary
- `SharedConfigModule`: validated environment configuration
- `SharedDatabaseModule`: Prisma client and transaction boundary
- `SharedAuthModule`: Better Auth request/session integration
- `UsersModule`: minimal application user/profile and roles
- `MusclesModule`: public controlled reference reads
- `ExercisesModule`: exercise identity and composed profile operations
- `MediaModule`: upload policy and `StorageService`
- `RoutinesModule`: owned templates and prescriptions
- `HealthModule`: liveness/readiness
- Later: `TrainingProgramsModule`, `WorkoutSessionsModule`, `AnalyticsModule`

Modules may share IDs and public service interfaces, but should not reach into one another’s Prisma repositories. Cross-aggregate writes (for example exercise plus muscle assignments and profiles) are coordinated by one application service in one transaction.

## Training Programs architecture pilot

`TrainingProgramsModule` is the first isolated pilot of a lean Clean Architecture/DDD vertical slice inside the existing modular monolith. This is not approval for a repository-wide rewrite. Existing modules keep their current structure until the pilot is implemented, tested, and evaluated.

The pilot uses feature ownership first and layers inside the feature:

```text
apps/api/src/modules/training-programs/
  domain/
    entities/
    errors/
    repositories/
  application/
    use-cases/
    models/
  infrastructure/
    prisma/
  presentation/
    http/dto/
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
- **Application** owns use-case orchestration and transport-neutral input/output models. It depends on domain contracts, not concrete persistence.
- **Infrastructure** implements feature-specific repository ports with Prisma, maps database rows to domain/application models, and owns atomic persistence details.
- **Presentation** owns NestJS controllers, authentication decorators, HTTP request/response DTOs, Swagger annotations, and translation from application/domain errors to the established HTTP contract.
- **Module composition** binds repository tokens to Prisma implementations and wires use cases/controllers.

Keep the pilot lean:

- Keep shared domain primitives limited to the proven `Entity` and `UniqueId` kernel; do not add generic repositories, use cases, result wrappers, event buses, or a CQRS dependency.
- Introduce a value object only when it protects a meaningful compound invariant or behavior. Do not wrap `ownerId`, name, or description merely to avoid primitives.
- Repository methods are aggregate/use-case specific and preserve ownership and transaction guarantees; do not expose generic unscoped CRUD.
- Prisma types and generated enums do not cross the infrastructure boundary.
- Shared database, authentication, and configuration infrastructure lives under `modules/shared/infrastructure`; feature modules import focused shared modules explicitly, while `AppModule` composes them through `SharedInfrastructureModule`.
- Cross-feature access uses narrow ports or feature-owned repository operations; a module never imports another feature’s Prisma implementation.

After the backend slice is complete, evaluate file count, rule placement, test clarity, transaction handling, and change cost. Migrate another feature only with a separate approved decision.

## Frontend architecture

Use server components for public, read-oriented page shells and metadata where useful. Use client components for TanStack Query interactions, filters, forms, ordering, and authenticated mutations. Route groups should separate public library, authenticated app, and admin surfaces. React Hook Form plus Zod handles immediate browser feedback; Nest DTO validation remains authoritative.

## Request flow

1. Nginx terminates HTTPS and proxies based on path.
2. Better Auth session cookies are secure, HTTP-only, and same-site.
3. NestJS resolves the authenticated principal and role.
4. Controllers validate DTOs and delegate to application services or, in the Training Programs pilot, explicit application use cases.
5. Services/use cases enforce domain rules and query-level ownership through feature contracts.
6. Prisma executes constrained reads/writes directly for existing modules or behind the Training Programs infrastructure adapter, using transactions for aggregate changes.
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
- A request through Nginx reaches both the web and `/api/health/ready`.
- Configuration startup fails clearly when a required variable is absent.
- OpenAPI output is generated and checked for unexpected changes.

## Future extensions

A worker process, cache, queue, or read model is added only after measurements justify it. The modular boundaries above provide extraction points without pre-building distributed infrastructure.
