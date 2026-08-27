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
- Optional Cloudinary-served image URLs when approved assets are available; image upload and image-management workflows are post-MVP
- Public exercise list/detail with search, pagination, and useful filters
- Better Auth sessions, authenticated app shell, and an administrator role
- Private user-owned routines with ordered prescriptions, duplication, and deletion
- Reusable multi-week training-program templates and user-owned adopted-program execution
- WorkoutSession records with completed sets and historical prescription snapshots
- Initial explainable analytics derived from raw workout history
- Responsive, accessible UI and proportionate automated tests
- Docker-based Oracle Cloud VPS production deployment with HTTPS, backups, logs, and rollback runbook

### Excluded

Named weekdays, scheduled calendar dates, calendar synchronization, recommendation engines, subjective recovery, fatigue tracking, coach organizations, sport-specific mappings, social activity, AI, nutrition, payments, notifications, user-created exercises, image uploads, image-management workflows, and multiple exercise media assets.

## Release phases

### Phase 0 — Foundation

Create the repository structure, configuration schema, Docker Compose services, initial CI, database connection, migration workflow, test harnesses, shared lint/format rules, API error format, and skeleton web/API health routes.

### Phase 1 — Muscle reference slice

Ship idempotent muscle seed data, hierarchy queries, public list/detail API, and responsive list/detail UI. There is no normal-user mutation UI.

### Phase 2 — Exercise identity slice

Ship classifications, exercise CRUD for a temporary developer/admin workflow, and public list/detail pages. Add search, pagination, sorting, slug rules, and audit-safe deletion behavior.

### Phase 3 — Rich exercise profile

Add transactional muscle assignments, capability profile, demand profile, form sections, filtering, and score help. All writes become admin protected before any shared environment is public.

### Phase 4 — Media slice (post-MVP)

After MVP, add Cloudinary asset management for generated exercise and muscle images, including approved URL assignment, upload/replace/remove workflows, validation, and lifecycle cleanup. MVP only reads optional Cloudinary URLs; it does not accept image uploads during muscle or exercise creation.

### Phase 5 — Authentication and routines

Integrate Better Auth with NestJS request authentication. Add private routine CRUD, ordered prescriptions, duplication, optimistic reordering, ownership-scoped queries, and authorization tests.

### Phase 6 — Production MVP hardening

Complete accessibility checks, rate limiting, security headers, data backup/restore rehearsal, production Compose/Nginx/Certbot configuration, deployment automation, smoke tests, and operational docs.

### Phase 7 — Training programs and weekly scheduling

Compose routines into reusable multi-week templates using relative
`weekNumber`/`dayNumber` slots. Training programs do not own calendar dates and
do not add performance records.

### Phase 8 — Sessions and performance (MVP)

Ship a usable historical-training vertical slice built around
`WorkoutSession -> ExercisePerformance -> CompletedSet`. Support freestyle and
routine-based workout start independently of adopted-program execution. Store
authoritative prescription snapshots and strength/repetition set
facts, enforce owned aggregate mutations and the
`IN_PROGRESS -> COMPLETED|CANCELLED` lifecycle, and provide active-workout,
workout-history, and exercise-history reads. The active experience is
mobile-first. Duration/distance modes can follow. See
[workout sessions](14-workout-sessions.md).

### Phase 8.5 — Adopted programs and integrated execution (MVP)

Introduce `AdoptedTrainingProgram` and `ProgramWorkoutOccurrence` as the user-owned
execution layer between reusable training-program templates and historical
workout sessions. Adoption copies the relative program schedule, tracks
lifecycle and progress, launches only the next pending occurrence, preserves
cancelled attempts for retry, supports explicit skip behavior, and carries
stable program provenance into workout history. Ship the active-program
frontend and ownership, concurrency, atomic-transaction, and snapshot tests.

This phase does not add named weekdays, calendar dates, rescheduling, or
calendar synchronization. Routine prescriptions remain live until an
occurrence starts; the resulting `ExercisePerformance` snapshot is historical
authority after start. See [training programs](13-training-programs.md).

### Phase 9 — Basic analytics (MVP)

Begin only after Phase 8.5 integrated execution and history are stable and
trustworthy. Add completed sessions, consistency, volume, estimated 1RM, PR
detection, exercise frequency,
and basic muscle-set estimates. Compute from raw history initially and label
heuristic involvement/formula assumptions; advanced fatigue and opaque coaching
remain later work.

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
              └─ Auth + owned routines
                  └─ Production MVP
                      └─ Media and training programs
                      └─ Workout sessions
                          └─ Adopted-program execution
                              └─ Analytics
                                  └─ Recommendations/recovery
```

Authentication can be developed alongside exercise profiles, but routines cannot ship without it. Analytics cannot precede stable historical sessions and adopted-program execution.

## Release management rules

- Use expand/migrate/contract database changes once production exists.
- Each release has a feature flag only when incomplete behavior could reach production; do not build a general flag platform for the MVP.
- Seed-data changes are reviewed like migrations and have stable identifiers/slugs.
- A phase is complete only after its acceptance tests and operational notes pass.
- Do not begin a downstream feature merely because its tables are easy to create.

## Roadmap testing gates

Every phase must pass lint, type checks, unit tests, relevant integration tests, migration from a clean database, and a production build. Ownership or historical-data phases require negative authorization and immutability tests before merge.

## Open questions

Commercial scope, initial exercise catalog size, Cloudinary asset workflow, and whether the first VPS database runs in Compose remain decisions recorded in [open decisions](24-open-decisions.md). None expands MVP scope.
