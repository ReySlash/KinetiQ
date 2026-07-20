# Scope and roadmap

## Purpose

This roadmap prevents the final vision from expanding the first release. Each release should include database, API, UI, authorization, tests, documentation, and deployment changes needed for one usable slice.

## MVP scope

### Included

- Monorepo foundation, PostgreSQL, Prisma, Docker development, CI, OpenAPI, health checks
- Seeded muscle hierarchy with public read endpoints and pages
- Admin-managed exercise identity and stable classifications
- Exercise–muscle assignments with role and 0–5 involvement
- Capability and demand profiles with documented 0–5 values
- One exercise thumbnail, alt text, placeholder, validation, and swappable storage
- Public exercise list/detail with search, pagination, and useful filters
- Better Auth sessions, authenticated app shell, and an administrator role
- Private user-owned routines with ordered prescriptions, duplication, and deletion
- Responsive, accessible UI and proportionate automated tests
- Docker-based Oracle Cloud VPS production deployment with HTTPS, backups, logs, and rollback runbook

### Excluded

Workout sessions, completed sets, plans and calendars, analytics dashboards, recommendation engines, subjective recovery, fatigue tracking, coach organizations, sport-specific mappings, social activity, AI, nutrition, payments, notifications, user-created exercises, and multiple exercise media assets.

## Release phases

### Phase 0 — Foundation

Create the repository structure, configuration schema, Docker Compose services, initial CI, database connection, migration workflow, test harnesses, shared lint/format rules, API error format, and skeleton web/API health routes.

### Phase 1 — Muscle reference slice

Ship idempotent muscle seed data, hierarchy queries, public list/detail API, and responsive list/detail UI. There is no normal-user mutation UI.

### Phase 2 — Exercise identity slice

Ship classifications, exercise CRUD for a temporary developer/admin workflow, and public list/detail pages. Add search, pagination, sorting, slug rules, and audit-safe deletion behavior.

### Phase 3 — Rich exercise profile

Add transactional muscle assignments, capability profile, demand profile, form sections, filtering, and score help. All writes become admin protected before any shared environment is public.

### Phase 4 — Media slice

Add `StorageService`, local and object-storage adapters, validated upload/finalization/delete lifecycle, thumbnail display, placeholders, and orphan cleanup.

### Phase 5 — Authentication and routines

Integrate Better Auth with NestJS request authentication. Add private routine CRUD, ordered prescriptions, duplication, optimistic reordering, ownership-scoped queries, and authorization tests.

### Phase 6 — Production MVP hardening

Complete accessibility checks, rate limiting, security headers, data backup/restore rehearsal, production Compose/Nginx/Certbot configuration, deployment automation, smoke tests, and operational docs.

### Phase 7 — Training plans and weekly scheduling

Compose routines into dated or weekday-based plans. Do not add performance records yet.

### Phase 8 — Sessions and performance

Create snapshot-based workout history with session exercises and completed sets. Support strength/repetition sets first; duration/distance modes can follow.

### Phase 9 — Basic analytics

Add deterministic calculations: consistency, completed sessions, volume, estimated 1RM, PRs, exercise frequency, and muscle-set estimates. Label indirect involvement and formula assumptions.

### Phase 10 — Progression and recovery

Add rules-based progression suggestions, then optional recovery check-ins and fatigue heuristics. Recommendations remain explainable and dismissible.

### Phase 11 — Coach and athlete exploration

Validate organization membership, consent, data access, audit, and revocation before implementation. This is not an extension of the simple owner check; it introduces a tenancy model.

## Dependencies

```text
Foundation
  └─ Muscle library
      └─ Exercise identity
          ├─ Muscle assignments
          ├─ Capability and demand profiles
          └─ Media
              └─ Auth + owned routines
                  └─ Training plans
                      └─ Workout sessions
                          └─ Analytics
                              └─ Recommendations/recovery
```

Authentication can be developed alongside exercise profiles, but routines cannot ship without it. Analytics cannot precede stable historical sessions.

## Release management rules

- Use expand/migrate/contract database changes once production exists.
- Each release has a feature flag only when incomplete behavior could reach production; do not build a general flag platform for the MVP.
- Seed-data changes are reviewed like migrations and have stable identifiers/slugs.
- A phase is complete only after its acceptance tests and operational notes pass.
- Do not begin a downstream feature merely because its tables are easy to create.

## Roadmap testing gates

Every phase must pass lint, type checks, unit tests, relevant integration tests, migration from a clean database, and a production build. Ownership or historical-data phases require negative authorization and immutability tests before merge.

## Open questions

Commercial scope, initial exercise catalog size, thumbnail provider, and whether the first VPS database runs in Compose remain decisions recorded in [open decisions](24-open-decisions.md). None expands MVP scope.

