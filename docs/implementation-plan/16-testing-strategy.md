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

### Frontend

- **Unit/component (Vitest + React Testing Library):** components, form sections, accessibility semantics, URL filter state, loading/error/empty states.
- **Query/mutation tests:** Mock Service Worker at the network boundary, cache keys, invalidation, optimistic rollback, server error mapping.
- **Accessibility:** `jest-axe`/`vitest-axe` for targeted checks plus keyboard/manual testing; automated checks do not replace review.
- **Playwright E2E:** high-value cross-page workflows with a real web/API/PostgreSQL stack.

## Required invariant matrix

| Invariant | Unit/DTO | DB integration | API E2E | UI/E2E |
| --- | --- | --- | --- | --- |
| Scores remain in 0–5 | Yes | `CHECK` proof | Invalid payload | Field error |
| Exercise/muscle pair unique | Duplicate validation | Compound PK/concurrency | Conflict/validation | Selector prevents duplicate |
| Exercise aggregate atomic | Service behavior | Rollback | Failed child leaves nothing | Error preserves form |
| Admin-only reference writes | Policy | — | User/anonymous denied | Admin navigation only |
| Routine owner isolation | Policy | Scoped query | Two-user matrix | Two-user Playwright smoke |
| Session history survives template edits | Later unit | Snapshot relations | Regression E2E | History comparison |
| Media failure leaves no incomplete data | Service | Metadata/object cleanup | Upload failure | Retry/prior image remains |

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
- Later: historical sessions remain unchanged after routine/exercise edits.
- Upload/transform/database failures preserve the previous image and produce cleanup work.

## Frontend testing rules

Test behavior users observe, not internal state or implementation details. Prefer semantic queries (`getByRole`, label text). Each data page needs loading, network error, empty, success, and unauthorized/expired-session coverage. Each form needs client validation, server validation mapping, disabled/in-flight submission, resubmission, and unsaved-change behavior.

Playwright’s MVP suite should cover:

1. Public visitor searches muscles/exercises and opens detail.
2. Admin signs in, creates a complete exercise with muscle/profile data and thumbnail, edits it, and public detail updates.
3. Normal user cannot reach/mutate admin actions.
4. User creates a routine, adds/reorders prescriptions, duplicates, edits, and deletes it.
5. Second user cannot access the first user’s routine by URL/API.

Use accessibility snapshots/keyboard steps where meaningful. Avoid visual snapshot testing as the primary proof; add a small visual regression set later if stable rendering infrastructure exists.

## Coverage and CI gates

Coverage percentages are indicators, not the goal. Set an initial global floor around 70% statements/branches for business packages and higher targeted expectations for pure domain rules; do not pad tests to meet a number. CI gates: formatting/lint, type check, unit/component, migration/schema validation, integration/API E2E, production builds, and a smaller Playwright critical path. Full browser suites may run on main/PR depending on cost.

Flaky tests are defects: quarantine only with an owner, issue, and expiry date. Record test artifacts (screenshots, traces, API logs) on failure without secrets.

## Performance and security tests

Before MVP, smoke test catalog pagination/search with a realistic seeded count, upload limits, auth rate limits, and basic dependency/container scanning. Formal load testing is not required, but define latency budgets and capture representative query plans for complex filters.

## Definition of done

A feature is not done until tests exist at the cheapest layer that can prove each rule, plus an integration/E2E path for its main workflow. Tests run from a clean checkout using documented commands, use PostgreSQL, isolate owners, and produce useful failure artifacts.

## Open questions

Choose CI provider, database isolation method, browser matrix, and exact coverage floors during foundation. Recommendation: GitHub Actions, Chromium on every PR, broader browsers on main/release, and Testcontainers or a Compose PostgreSQL service depending on team environment reliability.

