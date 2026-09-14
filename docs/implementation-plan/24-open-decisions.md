# Open decisions and decision log

## Purpose

Record choices that materially affect implementation. Resolve a decision just before its dependent release; avoid deciding distant features without evidence. When accepted, record date, rationale, consequences, and affected documents.

## Accepted architectural decisions

| Decision                                | Choice                                                                                                                                                                                                                 | Rationale                                                                                                                       |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Application shape                       | Next.js web + NestJS modular-monolith API + one PostgreSQL database                                                                                                                                                    | Realistic for one developer; clear boundaries without distributed overhead                                                      |
| API style                               | REST `/api` with Swagger/OpenAPI; versioning deferred                                                                                                                                                                  | Required stack, simple resource workflows, generated client opportunity                                                         |
| Contract sharing                        | Generate client types; do not share Prisma models/server DTO implementations                                                                                                                                           | Prevent server leakage and tight coupling                                                                                       |
| Score scale                             | Integer 0–5 with global labels plus per-field definitions                                                                                                                                                              | Consistent editorial comparisons                                                                                                |
| Exercise composition                    | Identity, muscle join, capability profile, demand profile separate                                                                                                                                                     | Prevent large mixed table and preserve semantics                                                                                |
| Equipment                               | Seeded reference table + explicit join                                                                                                                                                                                 | Multi-value and likely evolving metadata                                                                                        |
| Movement pattern                        | Seeded reference table                                                                                                                                                                                                 | Editorial taxonomy may evolve                                                                                                   |
| Stable behavior classifications         | Prisma enums                                                                                                                                                                                                           | Code-governed, small vocabularies                                                                                               |
| Exercise media                          | Tracked optimized WebP assets and fallbacks, with optional approved remote URLs; upload/management post-MVP                                                                                                           | Ships reliable beta assets without introducing binary upload scope                                                              |
| Sport transfer                          | No universal score; sport mapping deferred                                                                                                                                                                             | Context dependent and not MVP value                                                                                             |
| Routine ordering                        | Dense integers, unique within routine                                                                                                                                                                                  | Simple and sufficient for small templates                                                                                       |
| Routine duplicate exercise              | Allowed through surrogate `RoutineExercise.id`                                                                                                                                                                         | Same movement may appear in separate blocks                                                                                     |
| Ownership                               | Constrain database queries by ID and authenticated owner ID                                                                                                                                                            | Prevent IDOR and existence leaks                                                                                                |
| Analytics persistence                   | Raw history stored; derived/heuristic metrics computed initially                                                                                                                                                       | Explainable and avoids stale aggregates                                                                                         |
| Production media                        | Tracked static WebP assets for the beta; managed provider and upload architecture deferred                                                                                                                             | Keeps the first deployment reproducible while leaving later media delivery provider-neutral                                     |
| Closed-beta topology                    | Next.js on Vercel, Dockerized NestJS behind Nginx on Oracle Cloud, and Neon PostgreSQL; browser `/api` calls use a Vercel rewrite to the API hostname                                                                  | Separates the independently hosted web and API while preserving same-origin browser requests                                    |
| First-beta release process              | Vercel deploys reviewed `main`; the API is manually built on the VPS from the same reviewed SHA; no image registry or automated API deployment yet                                                                    | Keeps the first release traceable without premature deployment orchestration                                                     |
| Muscle involvement scale                | Store and validate integers 0–5; warn on usually-unnecessary zero assignments                                                                                                                                          | Matches the project-wide required scale while preserving explicit “negligible” meaning                                          |
| Training Programs backend architecture  | Pilot lean Clean Architecture/DDD layers inside one vertical feature module; leave existing modules unchanged                                                                                                          | Tests architectural value on a rule-bearing aggregate without authorizing a repository-wide rewrite                             |
| Workout-session strength facts          | Canonical kilograms in `Decimal(7,2)`, retain entered KG/LB, and store `CompletedSet.isWarmup`                                                                                                                         | Preserves precise raw facts and the user-entered unit without expanding into later modalities                                   |
| Workout-session history                 | Completed/cancelled sessions are immutable through normal commands; routine provenance is nullable with `SetNull`; prescription snapshots are explicit columns                                                         | Template changes or deletion must not rewrite historical performance                                                            |
| Workout-session concurrency and time    | Optimistic session versions, one database-enforced active session per user, IANA timezone metadata, and UTC timestamps                                                                                                 | Protects aggregate mutations and renders history in the recorded context                                                        |
| Adopted-program interim snapshot policy | Copy the program name, declared duration, and relative schedule at adoption; resolve the live routine prescription when an occurrence starts; use the resulting `ExercisePerformance` snapshot as historical authority | Preserves adopted progress while avoiding premature program-versioning infrastructure                                           |
| Adopted-program transaction ownership   | Launch is one atomic `adopted-training-programs` application-port operation; completion/cancellation use explicit workout-session command-side operations that atomically propagate linked occurrence/program transitions | Keeps Prisma in infrastructure, prevents partial cross-aggregate state, and avoids circular modules or distributed coordination |

## Decisions required before R0

### Package/workspace orchestration

**Options:** pnpm scripts only; pnpm + Turborepo; Nx.

**Recommendation:** pnpm workspaces with simple scripts; introduce Turborepo when caching measurably helps. Nx adds structure/overhead unnecessary for two apps.

### UUID generation

**Options:** v4; time-ordered v7.

**Recommendation:** UUIDv4 for universal support unless a short foundation spike proves UUIDv7 works consistently across Prisma, PostgreSQL defaults, seeds, OpenAPI, and tests before the first migration.

### Database naming mapping

**Options:** Prisma-default mixed-case identifiers; map to snake_case.

**Recommendation:** snake_case database identifiers via Prisma mappings for conventional SQL operations, accepting some schema verbosity.

### Initial authentication method

**Options:** email/password with verification; a single OAuth provider; both.

**Recommendation:** choose one. Email/password avoids provider dependency but requires reliable transactional email and reset flows. A single OAuth provider minimizes credential handling but excludes some users. Decide based on private-beta audience and email operational readiness.

### Better Auth NestJS integration path

**Options:** pin the community-maintained NestJS adapter; mount Better Auth’s official Node handler with carefully ordered body parsing and implement the Nest principal bridge.

**Recommendation:** spike the community adapter first because it provides guards/decorators, but keep the auth instance and policy layer adapter-neutral. Prove raw-body, JSON, multipart, global guard, public-route, and production proxy behavior before accepting it. Prisma Migrate remains the only migration executor for generated Better Auth models.

### CI and container registry

**Options:** GitHub Actions/GHCR or another integrated provider.

**Recommendation:** GitHub Actions and GHCR if the repository is on GitHub; lowest setup burden and immutable SHA tags.

## Decisions required before R1–R2

### Initial taxonomy/catalog size

Define the exact body regions, muscle groups/children, movement patterns, equipment, and first exercise count. Recommendation: 30–60 common exercises and only the muscle detail required to classify them. Review parent/child double-count behavior before seed approval.

### Slug lifecycle

**Options:** immutable after publish; mutable with redirects; always derive from name.

**Recommendation:** immutable after first publication for MVP. Add aliases/redirect records before permitting changes.

### Admin draft workflow

**Options:** only complete records; persistent draft/published status.

**Recommendation:** complete records only plus client-side unsaved form state for a small admin team. Add drafts when curation volume demonstrates the need.

### Search implementation

**Options:** `ILIKE`; PostgreSQL trigram; full-text; external search.

**Recommendation:** start with normalized `ILIKE`, measure with realistic catalog data, then add `pg_trgm` if partial/fuzzy search needs it. No external search in MVP.

## Decisions required before post-MVP media work

### Managed-media provider and asset topology

Choose the provider, then decide project separation by environment, asset folders, naming conventions, delivery domain, transformation policy, and retention behavior.

### Thumbnail presentation policy

Decide 1:1 versus 4:3 source/crop, provider transformation parameters, browser formats, public asset domain, and cache invalidation. This is post-MVP; the beta uses tracked assets and approved URLs as provided.

### Upload architecture (post-MVP)

**Options:** provider-signed upload, server-mediated upload, or an external editorial generation pipeline that only provides approved URLs.

**Recommendation:** defer until the image-generation workflow is complete; do not add upload endpoints to MVP.

## Resolved R9 deployment decisions

### Production PostgreSQL location

**Decision:** Neon PostgreSQL. Provider backup/PITR verification and a later
independent logical-backup procedure remain operational follow-up work.

### Domain and topology

**Decision:** `https://kinetiq.reyslash.com` is the Vercel-hosted frontend and
`https://api.kinetiq.reyslash.com` is the Oracle-hosted API. Browser code calls
same-origin `/api`; Vercel rewrites those requests to the API hostname. Nginx
terminates API HTTPS and proxies to the loopback-bound NestJS container.

### Build and release topology

**Decision:** CI builds both production images for validation. Vercel is the
production web runtime. The first-beta API is built manually on the Oracle VPS
from a reviewed Git SHA; a registry and automated API deployment remain
deferred.

## Remaining operational decisions after beta launch

### Recovery objectives and retention

Recommendation for private MVP: 24-hour RPO, 4-hour RTO, daily/weekly/monthly backup retention, and quarterly restore drills. Confirm based on expected user cost of lost routines.

### Monitoring/error provider

Choose off-host uptime/alerting, error tracking, and log retention with privacy/data-region review. Minimum launch requirement is external uptime/backup/certificate/disk alerts and correlated structured logs.

## Deferred product decisions

- Custom exercises: optional `ownerId` on `Exercise` versus a separate `CustomExercise`. Revisit only with sharing/moderation/search rules.
- Exercise relationships: directionality, inverse generation, duplicate/conflict rules, and curator UI.
- Broader training-program versioning beyond the accepted copied-schedule,
  live-routine, session-snapshot interim policy.
- Completed-history correction and audit workflow.
- Broader request idempotency beyond optimistic session versions, conditional
  occurrence transitions, and database uniqueness constraints.
- Routine and training-program archival policy beyond history-preserving source
  relations and explicit unavailable-source behavior.
- Calendar mapping, named weekdays, scheduled dates, rescheduling, and calendar
  synchronization.
- Coach-assigned programs and their consent/ownership lifecycle.
- Routine/program progression recommendations and percentage-based loading.
- Duration/distance workout modalities and their units.
- Analytics formulas, working-set classification, unilateral/bodyweight conventions.
- General athletic-quality curation rubric and public value.
- Sport taxonomy, evidence/confidence policy, positions/events.
- Coach organization tenancy, consent, grant expiry, audit, billing.
- Account export/deletion, retention, and long-term performance-data privacy.

## Decision template

```text
Decision:
Status: proposed | accepted | superseded
Date:
Needed by release:
Context:
Options:
Choice:
Rationale:
Consequences:
Affected documents/migrations:
```

## Review cadence

Review open items at the start of each release, not on a fixed ceremony. Remove no historical accepted decision; mark it superseded and link the replacement so migrations and behavior remain understandable.
