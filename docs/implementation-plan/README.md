# KinetiQ implementation plan

## What this project is

KinetiQ is a full-stack fitness development platform that begins with a trustworthy exercise reference library and a practical routine builder. Later releases add scheduled training, workout performance, explainable analytics, progression guidance, recovery signals, and optional coach–athlete workflows.

The plan is deliberately incremental. A single developer should be able to ship each release as a usable vertical slice, gather feedback, and change later models without first building the final product. Editorial exercise ratings are relative classifications, not medical or scientific measurements.

## How to use these documents

The numbered documents establish decisions and implementation contracts. Feature documents describe scope, models, endpoints, UI, validation, authorization, tests, sequence, definition of done, and future extensions. Concern documents define rules shared by several features.

Recommended reading order:

1. [Project vision](00-project-vision.md)
2. [Scope and roadmap](01-scope-and-roadmap.md)
3. [Architecture](02-architecture.md)
4. [Domain model overview](03-domain-model-overview.md)
5. Feature documents 04–15 in number order
6. Cross-cutting implementation documents 16–22
7. [Release plan](23-release-plan.md) and [open decisions](24-open-decisions.md)
8. Deferred feature designs 25–27 when work approaches those phases

When documents disagree, the more specific feature document wins. Changes that alter an accepted architectural decision should also update `24-open-decisions.md` and every affected model/API contract.

## Document map

| Document | Concern | MVP status |
| --- | --- | --- |
| [00](00-project-vision.md) | Product principles and success | Governing |
| [01](01-scope-and-roadmap.md) | MVP boundary and phased roadmap | Governing |
| [02](02-architecture.md) | Monorepo and runtime architecture | MVP |
| [03](03-domain-model-overview.md) | Domain boundaries and data lifecycle | MVP foundation |
| [04](04-muscle-library.md) | Seeded muscle reference data | MVP |
| [05](05-exercise-library.md) | Exercise identity, CRUD, search | MVP |
| [06](06-exercise-muscle-relations.md) | Muscle roles and involvement | MVP |
| [07](07-exercise-capabilities.md) | Development potential profile | MVP |
| [08](08-exercise-demand-and-fatigue.md) | Technical, loading, and recovery demand | MVP |
| [09](09-athletic-qualities-and-sport-transfer.md) | General qualities and sport-specific relevance | General qualities deferred; sport mapping later |
| [10](10-exercise-media.md) | Image metadata and storage abstraction | MVP thumbnail slice |
| [11](11-routine-builder.md) | User-owned reusable workout templates | MVP |
| [12](12-authentication-and-authorization.md) | Better Auth integration and ownership | MVP |
| [13](13-training-plans.md) | Plans and weekly schedules | Post-MVP |
| [14](14-workout-sessions.md) | Historical performed training | Post-MVP |
| [15](15-analytics.md) | Derived metrics and recommendations | Post-MVP |
| [16](16-testing-strategy.md) | Test pyramid, fixtures, and gates | MVP |
| [17](17-api-design.md) | REST conventions and contracts | MVP |
| [18](18-frontend-architecture.md) | Next.js pages, state, forms, accessibility | MVP |
| [19](19-database-and-prisma.md) | PostgreSQL/Prisma constraints and migrations | MVP |
| [20](20-deployment.md) | Docker, Oracle VPS, CI/CD, rollback | MVP |
| [21](21-security.md) | Threat controls and privacy | MVP |
| [22](22-observability-and-backups.md) | Logs, health, restore readiness | MVP baseline |
| [23](23-release-plan.md) | Small release sequence | Governing |
| [24](24-open-decisions.md) | Decision log and unresolved choices | Living document |
| [25](25-exercise-relationships.md) | Variations, substitutions, progressions, regressions | Post-MVP |
| [26](26-recovery-and-fatigue-tracking.md) | Athlete context and subjective recovery | Post-MVP |
| [27](27-coach-and-athlete.md) | Delegated access and organizations | Exploratory |

## First production MVP boundary

The MVP includes seeded, read-only muscle data; admin-managed global exercises; a thumbnail per exercise; muscle assignments; capability and demand profiles; exercise search/filtering; Better Auth; user-owned routines; routine exercise prescriptions; duplication; responsive UI; automated backend/frontend tests; and Docker deployment.

The MVP explicitly excludes performed-workout tracking, training plans/calendar scheduling, analytics, progression recommendations, recovery/fatigue check-ins, AI, nutrition, payments, social features, coach organizations, sport-specific exercise mappings, user-created exercises, and multi-file exercise media.

## Recommended implementation order

1. Establish the monorepo, local Docker services, API/web shells, CI, configuration validation, and test databases.
2. Add Prisma, migrations, seeded muscles, and read-only muscle API/UI.
3. Add exercise identity/classification CRUD and library search.
4. Add transactional muscle assignments, then capability and demand profiles.
5. Add the storage abstraction and exercise thumbnails.
6. Integrate Better Auth and protect admin exercise mutations.
7. Add owned routines and prescriptions, including duplication and ordering.
8. Harden accessibility, security, observability, backups, and deployment; run the MVP acceptance suite.

Authentication is integrated after public reference-library slices so early work stays small. Before production data exists, admin mutation endpoints must be protected; no insecure production staging period is acceptable.

## Phase status

| Phase | Status at plan creation | Exit condition |
| --- | --- | --- |
| Foundation | Planned | Web/API/database run locally and in CI |
| Reference library | Planned | Seeded muscles and admin exercise management work end to end |
| Routine MVP | Planned | Authenticated users manage only their routines |
| Production MVP | Planned | Security, tests, deployment, backup and restore drill pass |
| Planning and scheduling | Deferred | Training plans can schedule reusable routines |
| Performance and analytics | Deferred | Immutable session history supports explainable metrics |
| Recommendations and recovery | Deferred | Rules use sufficient real data and expose rationale |
| Coach/athlete | Exploratory | Tenancy and consent model is validated |
