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

**Deliver:** Cloudinary asset assignment and, if still needed, admin-only upload/replace/remove workflows for generated exercise and muscle images. Add validation, alt text, CDN/cache policy, and lifecycle cleanup.

**Acceptance:** approved Cloudinary assets render safely; missing assets use placeholders; no provider credentials or internal paths leak; post-MVP upload/provider failures preserve prior metadata and cleanup behavior.

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

## R9 — Production MVP hardening and launch

**Deliver:** production images/Compose/Nginx/Certbot, chosen PostgreSQL/object storage, full CI gates, security headers/rate limits, structured logs/alerts, backups, runbooks, restoration and rollback rehearsal.

**Acceptance:** production-like deploy/smoke, two-user security suite, admin exercise lifecycle, routine lifecycle, HTTPS renewal test, off-host backup and isolated restore meet RPO/RTO. This is the MVP release.

## Post-MVP releases

- **R10:** training programs and weekly schedules
- **R11:** Phase 8 domain/persistence plus routine/freestyle session start,
  prescription snapshots, mutable completed strength sets, lifecycle commands,
  and active-workout retrieval
- **R12:** mobile-first recording/history UI, workout and exercise history
  reads, and the separately approved completed-history correction path
- **R13:** deterministic overview analytics and PRs
- **R14:** muscle/movement demand analytics with explicit heuristics
- **R15:** opt-in rules-based progression recommendations
- **R16:** recovery check-ins and fatigue-context experiments
- **R17+:** exercise relationships, general athletic qualities, sport mappings, coach/athlete discovery as separately validated slices

## Explicit non-goals through R9

No image uploads, image-management workflows, workout-performance tracking, training-program calendar, advanced analytics, recommendations, recovery/fatigue check-ins, AI, nutrition, payments, coach organizations, social features, sport-specific transfer, user-created exercises, or multiple media assets.

## Recommended first implementation task

Implement R0 as a narrowly scoped foundation pull request: workspace structure, web/API health pages, PostgreSQL/Prisma connection with an empty baseline migration, validated environment examples, development/test Compose, and CI for lint/type/unit/build. Do not add Muscle/Exercise models to the same change. The next pull request can then prove the complete migration/seed/API/UI pattern with R1.

## Status tracking

At plan creation all releases are `PLANNED`. Update this table when work begins; do not mark a release done until its acceptance block passes.

| Release | Status | Depends on |
| --- | --- | --- |
| R0 Foundation | In progress — runtime, CI, and operational documentation are implemented; clean-environment verification remains | — |
| R1 Muscles | Implemented in code; acceptance and clean-database verification remain | R0 |
| R2 Exercise identity | Implemented in code; admin/shared-environment security gate remains | R1 |
| R3 Muscle assignments | Implemented in code; acceptance verification remains | R2 |
| R4 Profiles | Implemented in code; acceptance verification remains | R3 |
| R5 Media | Deferred until post-MVP image generation is ready | R2, Cloudinary decisions |
| R6 Auth/admin hardening | In progress — Better Auth backend wiring exists; web flows and full HTTP authorization matrix remain | R0; gates shared R2–R5 |
| R7–R8 Routines | Implemented in backend/UI slices; final MVP acceptance and production hardening remain | R2, R6 |
| R9 Production MVP | Planned | R0–R8 |
| R10 Training programs | Backend template/schedule slice implemented; frontend and release acceptance remain | R9 |
| R11+ Sessions and later phases | Planned/deferred; Phase 8 is specified but not implemented | Auth + routines; R10/active-program adoption is not required for standalone or routine starts |
