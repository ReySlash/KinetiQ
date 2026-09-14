# Release plan

## Purpose

Translate the roadmap into small, independently verifiable releases suitable for one developer. Each release is a vertical slice; schema-only releases do not count as user value unless they are foundation work.

## Release checklist shared by all slices

- Scope and exclusions are written before implementation.
- Migration from clean/current database succeeds; seeds are idempotent where changed.
- API DTO/errors/OpenAPI and responsive UI states are complete.
- Authorization and negative cases are tested.
- Unit/integration/E2E coverage is proportionate to risk.
- Accessibility keyboard/error behavior is reviewed.
- Logs/health/backup impact is considered.
- Deployment and rollback notes exist; smoke test passes.

## R0 — Repository and runtime foundation

**Deliver:** pnpm monorepo, Next/Nest shells, PostgreSQL/Prisma, configuration validation, Docker Compose development/test, lint/type/test scripts, initial CI, problem responses, Swagger, health endpoints.

**Acceptance:** fresh clone reaches web and API through documented commands; clean migration works; CI builds both production apps; test database cannot point to development/production.

## R1 — Seeded muscle reference library

**Deliver:** muscle group/hierarchy schema, reviewed seeds, idempotent seed command, public list/detail API, list/detail UI, placeholders, filters.

**Acceptance:** seed twice without changes; hierarchy has no cycles; public user can search/filter/open muscles; no public mutation surface exists.

## R2 — Exercise identity and classifications

**Deliver:** equipment/movement seeds, core exercise CRUD, basic temporary admin path, public list/detail, search/pagination/filter, archive semantics, basic exercise form.

**Acceptance:** valid exercise appears publicly; invalid enums/text fail cleanly; slug and joins constrained; search plan is acceptable at representative catalog size.

**Security gate:** before any public/shared deployment, administrator authentication must protect mutation routes. It is acceptable to use local development-only bootstrap access during this slice, guarded by an environment mode that cannot start in production.

## R3 — Exercise muscle assignments

**Deliver:** explicit join/role/score, transactional aggregate write, muscle editor, role display and filtering.

**Acceptance:** duplicate pair impossible at UI/API/database; invalid score rejected; one primary required for active record; failed assignment rolls back the aggregate.

## R4 — Capability and demand profiles

**Deliver:** two one-to-one constrained profiles, score definitions/legend, admin form sections, public detail, limited useful filters.

**Acceptance:** every active exercise has complete 0–5 profiles; 0 and 5 boundaries work; stability development/demand remain distinct; fatigue caveat is visible; no deferred demand fields appear.

## R5 — Exercise and muscle media (post-MVP)

**Deliver:** the beta already includes tracked optimized WebP assets and fallbacks. After MVP, choose a managed-media provider and, if still needed, add admin-only assignment/upload/replace/remove workflows with validation, alt text, CDN/cache policy, and lifecycle cleanup.

**Acceptance:** approved static or remote assets render safely; missing assets use placeholders; no provider credentials or internal paths leak; any later upload/provider failures preserve prior metadata and cleanup behavior.

## R6 — Authentication and admin hardening

**Deliver:** Better Auth UI/session integration, application roles/bootstrap, admin policies, cookie/origin/rate-limit configuration, full reference-write authorization matrix.

**Acceptance:** anonymous/user/admin matrix passes through real HTTP sessions; revoked session fails; production cookies/CSRF/origin behavior verified; no insecure admin bypass can start in production.

This work may begin earlier and must be complete before any shared environment exposes admin mutation routes.

## R7 — Owned routine basics

**Deliver:** routine list/create/detail/delete, ordered exercise prescriptions, owner-scoped service/API, responsive builder.

**Acceptance:** user can build a valid private routine; duplicate exercise occurrences work; child writes are atomic; two-user isolation passes.

## R8 — Routine editing and duplication polish

**Deliver:** edit/reorder, duplicate, archived-exercise warnings, unsaved-change handling, query cache behavior, accessible reorder.

**Acceptance:** duplicate is independent; reorder canonical; mutation rollback works; keyboard/mobile Playwright workflow passes.

## R9 — Production MVP baseline and hardening

**Deliver:** Vercel-hosted Next.js, a Dockerized NestJS API behind Nginx on Oracle Cloud, Neon PostgreSQL, HTTPS, full CI gates, security headers/rate limits, structured logs, health checks, tracked production assets, backups, and rollback guidance.

**Acceptance:** the closed-beta baseline is deployed. Remaining acceptance work includes completing the public HTTPS journey, verifying operator-side controls and branch protection, exercising certificate renewal and rollback, and rehearsing backup restoration. External logical backups, alerting, detailed RPO/RTO measurement, and exhaustive incident runbooks are post-launch hardening rather than blockers for the initial beta.

## Historical roadmap after the production baseline

The following releases describe the sequence in which the current MVP slices
were planned. R10–R13 are now implemented in code; their remaining work is
production acceptance and operational hardening, as reflected in the status
table below.

- **R10:** reusable training-program templates and relative weekly schedules
- **R11:** standalone Phase 8 routine/freestyle session persistence, lifecycle,
  mobile recording, and history UI
- **R12:** Phase 8.5 adopted programs, copied schedules, integrated
  program-origin sessions, progress, retry/skip behavior, and active-program UI
- **R13:** deterministic overview analytics and PRs after integrated execution
- **R14:** muscle/movement demand analytics with explicit heuristics
- **R15:** opt-in rules-based progression recommendations
- **R16:** recovery check-ins and fatigue-context experiments
- **R17+:** exercise relationships, general athletic qualities, sport mappings, coach/athlete discovery as separately validated slices

## Remaining product non-goals

No image uploads, image-management workflows, training-program calendar,
calendar synchronization, advanced analytics, progression recommendations,
recovery/fatigue check-ins, AI, nutrition, payments, coach organizations,
social features, sport-specific transfer, user-created exercises, or multiple
media assets.

## Recommended next implementation task

Use the closed beta to validate the implemented slices through R13 while
closing the remaining operator-side deployment checklist. Prioritize public
acceptance, branch protection, Neon backup verification, rollback and restore
rehearsal, then monitoring and alerts. Do not begin recommendations or recovery
features until beta data and the analytics foundation are trustworthy.

## Status tracking

At plan creation all releases are `PLANNED`. Update this table when work begins; do not mark a release done until its acceptance block passes.

| Release                         | Status                                                                                                           | Depends on                    |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| R0 Foundation                   | Deployed in the closed beta; remaining operator controls are tracked separately                                  | —                             |
| R1 Muscles                      | Deployed; beta acceptance continues                                                                              | R0                            |
| R2 Exercise identity            | Deployed; final admin production-security acceptance remains                                                     | R1                            |
| R3 Muscle assignments           | Deployed; beta acceptance continues                                                                              | R2                            |
| R4 Profiles                     | Deployed; beta acceptance continues                                                                              | R3                            |
| R5 Media                        | Tracked optimized assets and fallbacks implemented; upload/management remains post-MVP                           | R2                            |
| R6 Auth/admin hardening         | Deployed with HTTP authorization tests; cookie, revocation, and public acceptance continue                       | R0; gates shared R2–R5        |
| R7–R8 Routines                  | Deployed with ownership coverage; beta acceptance continues                                                      | R2, R6                        |
| R9 Production MVP               | Closed-beta baseline deployed on Vercel, Oracle, and Neon; operational hardening remains                         | R0–R8                         |
| R10 Training-program templates  | Deployed; beta acceptance continues                                                                              | R9                            |
| R11 Standalone sessions         | Deployed; beta acceptance continues                                                                              | Auth + routines               |
| R12 Adopted-program execution   | Deployed with ownership, concurrency, rollback, and journey coverage; beta acceptance continues                 | R10, R11                      |
| R13 Analytics overview          | Deterministic read-only overview deployed; beta validation continues                                             | R12 stable integrated history |
| R14+ Heuristics and later phases | Deferred                                                                                                        | R13 validated                 |
