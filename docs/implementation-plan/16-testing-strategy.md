# Testing strategy

## Purpose

Testing should protect domain invariants, ownership, transaction boundaries, historical integrity, and essential user workflows without forcing every detail through expensive end-to-end tests.

## Test layers

### Backend

- **Unit tests (Jest):** pure domain rules, mappers, policies, score/tempo validation, analytics formulas later.
- **Service tests:** application behavior with narrow fakes where database behavior is irrelevant; verify orchestration, error mapping, and transaction intent.
- **Validation tests:** DTO transformations, unknown-field rejection, boundaries, nested arrays, enum allowlists.
- **Prisma integration tests:** real PostgreSQL constraints, transactions, query ownership, indexes, migrations, and seed behavior. Do not substitute SQLite.
- **API E2E (Supertest):** a real Nest app, auth/session test helpers, real test database, and HTTP contracts.
- **OpenAPI contract checks:** generation succeeds; optionally diff committed schema on intentional changes.

For the layered Routines and Training Programs modules, tests follow the
dependency boundaries established by the original Training Programs pilot:

- **Domain tests:** aggregate invariants and state transitions with no Nest testing module or database.
- **Use-case tests:** orchestration, authorization decisions, and error propagation using narrow repository fakes/mocks.
- **Mapper tests:** explicit Prisma-row to domain/response mapping, including nullable fields and schedule ordering.
- **Prisma repository integration tests:** real PostgreSQL ownership filters, routine eligibility, atomic child replacement, uniqueness, and referential actions.
- **Controller/DTO tests:** HTTP validation, auth principal extraction, Swagger response contracts, and error translation; controllers do not retest domain logic.

The implemented Workout Sessions module follows the same dependency-boundary
test strategy. Because it stores history, Phase 8 additionally requires lifecycle
transition tests, authenticated child mutation through the owned
`WorkoutSession` aggregate, real PostgreSQL decimal/ordering/transaction tests,
and purpose-built workout/exercise-history query tests. Its detailed matrix is
in [workout sessions](14-workout-sessions.md).

### Frontend

- **Unit/component (Vitest + React Testing Library):** components, form sections, accessibility semantics, URL filter state, loading/error/empty states.
- **Query/mutation tests:** Mock Service Worker at the network boundary, cache keys, invalidation, optimistic rollback, server error mapping.
- **Accessibility:** `jest-axe`/`vitest-axe` for targeted checks plus keyboard/manual testing; automated checks do not replace review.
- **Playwright E2E:** high-value cross-page workflows with a real web/API/PostgreSQL stack.

## Required invariant matrix

| Invariant                                        | Unit/DTO                   | DB integration                           | API E2E                            | UI/E2E                          |
| ------------------------------------------------ | -------------------------- | ---------------------------------------- | ---------------------------------- | ------------------------------- |
| Scores remain in 0–5                             | Yes                        | `CHECK` proof                            | Invalid payload                    | Field error                     |
| Exercise/muscle pair unique                      | Duplicate validation       | Compound PK/concurrency                  | Conflict/validation                | Selector prevents duplicate     |
| Exercise aggregate atomic                        | Service behavior           | Rollback                                 | Failed child leaves nothing        | Error preserves form            |
| Admin-only reference writes                      | Policy                     | —                                        | User/anonymous denied              | Admin navigation only           |
| Routine owner isolation                          | Policy                     | Scoped query                             | Two-user matrix                    | Two-user Playwright smoke       |
| Training program slot unique and within duration | Domain/DTO                 | Unique constraint/transaction            | Invalid and duplicate schedule     | Later editor validation         |
| Training program owner isolation                 | Use case                   | Scoped repository query                  | Anonymous/two-user/global matrix   | Later two-user smoke            |
| One non-terminal adopted program per user        | Domain/use case            | Partial unique index/concurrency         | Concurrent activation conflict     | Start-program conflict state    |
| Program occurrence advances exactly once         | Domain/use case            | Conditional update/transaction           | Complete/cancel/skip races         | Progress and next-workout state |
| Program session and occurrence remain atomic     | Use case port contract     | Start/complete/cancel rollback           | Complete journey and retry         | Resume/return-to-program flow   |
| Session owner and child isolation                | Phase 8 aggregate/use case | Owner-scoped parent/child writes         | Anonymous/two-user negative matrix | Two-user smoke                  |
| Session lifecycle and numeric invariants         | Phase 8 domain/DTO         | Decimal/order/status constraints         | Invalid transitions and set values | Mutable/completed states        |
| Session history survives template edits          | Phase 8 snapshot tests     | Snapshot relations                       | Routine edit regression            | History comparison              |
| Exercise archival preserves history              | Phase 8 domain/query       | Restrictive historical identity relation | Archive/history regression         | Archived identity state         |
| Media failure leaves no incomplete data          | Service                    | Metadata/object cleanup                  | Upload failure                     | Retry/prior image remains       |

## Database test isolation

Use a dedicated PostgreSQL container/database whose URL has an unmistakable test database name. Test startup must refuse URLs matching development/production allowlists. Apply migrations once per suite/worker strategy, then isolate tests with transactions where compatible or schema/database resets. Because parallel workers plus shared transactions can be tricky, begin with a small number of isolated database schemas or serialize integration suites; optimize only when runtime warrants it.

Seed only minimal deterministic fixtures through factories for most tests. Run the full production seed in a separate contract suite. Factories return explicit IDs and avoid wall-clock/random assumptions unless the test controls them.

## Auth test helpers

Create test utilities that obtain real Better Auth sessions for `USER_A`, `USER_B`, and `ADMIN`, or inject principals only in unit tests. API E2E must exercise the real authentication integration. Never add a test bypass that can activate in production configuration.

## Critical scenarios

- Duplicate muscle assignment is rejected by validation and database constraint.
- Every score field rejects -1, 6, fractional numbers, numeric strings if coercion is not intended, and accepts 0/5 as defined.
- Exercise identity, joins, capability, and demand records create/update in one transaction.
- Anonymous/normal users cannot mutate exercises or upload media.
- User B cannot discover, read, edit, delete, or duplicate user A’s routine.
- Reorder conflicts do not leave duplicate positions.
- Phase 8: historical prescription snapshots remain unchanged after
  routine/training-program edits, and exercise archival does not invalidate
  workout or exercise history.
- Adopted-program activation succeeds from a GLOBAL template and an owned
  PRIVATE template, conceals another user's private template, and rejects an
  empty schedule.
- When the approved future duration boundary is implemented, backend and
  frontend tests accept 52 weeks/364 days, reject values above either limit,
  and verify that user-facing feedback states both maximums.
- Concurrent activation attempts produce one non-terminal program and one stable
  conflict; the database partial unique index is exercised directly.
- Adoption copies the relative schedule, and later template edits do not rewrite
  the adopted program or occurrences.
- Only the next pending occurrence can start or skip; start/skip and duplicate-
  start races leave one valid result with no partial session.
- Starting a program workout conflicts with another active session and atomic
  launch rollback leaves both session and occurrence unchanged.
- Completion advances the occurrence and parent exactly once; resolving the
  final occurrence completes the parent program.
- Cancellation preserves the session, returns the occurrence to `PENDING`, and
  retry preserves both attempts while allowing at most one completed attempt.
- Pause/cancel is rejected while a program session is active.
- An unavailable source routine leaves the next occurrence `PENDING`; explicit
  skip advances to the following occurrence.
- Two-user tests isolate adopted programs, occurrences, attempts, and lifecycle
  commands.
- Upload/transform/database failures preserve the previous image and produce cleanup work.

## Frontend testing rules

Test behavior users observe, not internal state or implementation details. Prefer semantic queries (`getByRole`, label text). Each data page needs loading, network error, empty, success, and unauthorized/expired-session coverage. Each form needs client validation, server validation mapping, disabled/in-flight submission, resubmission, and unsaved-change behavior.

Playwright’s MVP suite should cover:

1. Public visitor searches muscles/exercises and opens detail.
2. Admin signs in, creates a complete exercise with muscle/profile data and thumbnail, edits it, and public detail updates.
3. Normal user cannot reach/mutate admin actions.
4. User creates a routine, adds/reorders prescriptions, duplicates, edits, and deletes it.
5. Second user cannot access the first user’s routine by URL/API.
6. User opens a global program, adopts it, sees the copied active schedule,
   starts the next workout, records at least one set, completes the session,
   returns to the active program, and sees updated progress and the next
   occurrence.

Use accessibility snapshots/keyboard steps where meaningful. Avoid visual snapshot testing as the primary proof; add a small visual regression set later if stable rendering infrastructure exists.

## Coverage and CI gates

Coverage percentages are indicators, not the goal. Set an initial global floor around 70% statements/branches for business packages and higher targeted expectations for pure domain rules; do not pad tests to meet a number. CI gates: formatting/lint, type check, unit/component, migration/schema validation, integration/API E2E, production builds, and a smaller Playwright critical path. Full browser suites may run on main/PR depending on cost.

Flaky tests are defects: quarantine only with an owner, issue, and expiry date. Record test artifacts (screenshots, traces, API logs) on failure without secrets.

### Repository verification commands

The root scripts do not currently represent every test category. In particular,
`pnpm test` runs the API Jest suite only; it does not run the web unit or browser
suites. Use the relevant explicit commands when verifying a cross-stack slice:

```text
pnpm lint
pnpm typecheck
pnpm --filter api test
pnpm --filter api test:e2e
pnpm --filter web test:unit
pnpm --filter web test:browser:mocked
pnpm --filter web test:a11y
pnpm --filter web test:smoke
pnpm --filter api exec prisma validate
pnpm build
```

Migration work additionally requires applying migrations to both a clean
PostgreSQL database and a database at the prior current schema, then running the
database-specific integration suites. Record those commands and results in the
task report.

The existing `pnpm format` command writes formatted files and is not a
non-mutating formatting check. Do not report it as a passing check merely
because it completed. Until a repository-wide `format:check` script is added,
run an appropriate Prettier `--check` command for supported files or state
clearly that a non-mutating formatting check is unavailable. Adding or changing
formatting tooling remains a separate repository decision.

## Performance and security tests

Before MVP, smoke test catalog pagination/search with a realistic seeded count, auth rate limits, and basic dependency/container scanning. Image upload limits and provider behavior belong to the post-MVP Cloudinary media slice. Formal load testing is not required, but define latency budgets and capture representative query plans for complex filters.

## Definition of done

A feature is not done until tests exist at the cheapest layer that can prove each rule, plus an integration/E2E path for its main workflow. Tests run from a clean checkout using documented commands, use PostgreSQL, isolate owners, and produce useful failure artifacts.

## Open questions

Choose CI provider, database isolation method, browser matrix, and exact coverage floors during foundation. Recommendation: GitHub Actions, Chromium on every PR, broader browsers on main/release, and Testcontainers or a Compose PostgreSQL service depending on team environment reliability.
