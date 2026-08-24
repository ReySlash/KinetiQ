# Database and Prisma

## Purpose and recommendation

Use PostgreSQL as the single transactional store and Prisma as the application ORM. Preserve important invariants in both application validation and database constraints because APIs, seeds, migrations, and concurrency can bypass UI checks.

## Environments

Use separate development, test, staging, and production databases/users. Test configuration must refuse a non-test URL. Production application credentials should not own superuser/create-database privileges; migration credentials may be separate. Require TLS for external managed PostgreSQL.

## Identifier and naming choices

Use native PostgreSQL UUID columns and generate UUIDv4 identifiers in the application before persistence. Models therefore use `@id @db.Uuid` without database or Prisma schema defaults, and API/seed write paths provide the ID explicitly. Do not change ID type or generation ownership after release without strong cause.

Prisma models/fields use PascalCase/camelCase; map to snake_case PostgreSQL tables/columns consistently if desired. Make that choice in the first migration. Timestamps are `timestamptz(3)` in UTC. Add `createdAt`/`updatedAt`; use `archivedAt` only where lifecycle requires it.

## Constraint strategy

Prisma schema expresses keys, unique composites, foreign keys, referential actions, and indexes. SQL migrations add checks or partial/functional indexes Prisma cannot fully express:

- Every editorial score `BETWEEN 0 AND 5`
- Routine numeric ranges and `min_reps <= max_reps` where feasible
- Compound uniqueness for exercise-muscle, exercise-equipment, and routine order
- Better Auth account identity uniqueness on `(providerId, accountId)`
- Case-insensitive functional uniqueness if required
- Partial uniqueness such as one active training program only if product rules demand it later

Keep custom SQL in generated migration folders with comments and integration tests. Never rely on DTO validation alone.

## Referential actions

- Exercise deletion cascades capability/demand and editorial joins, but should be archive/restrict once routines/history reference it.
- Muscle deletion is restricted when children or assignments exist.
- Routine deletion cascades `RoutineExercise`, but is restricted when a `TrainingProgramRoutine` references the routine so a program cannot silently lose a scheduled workout.
- Training program deletion cascades only its `TrainingProgramRoutine` schedule rows; referenced routines remain independently reusable.
- User deletion behavior needs a product policy. Prefer a controlled account-deletion job over broad database cascade once history exists.
- Phase 8 source/provenance references must preserve snapshots when templates
  change. Choose `SetNull` or `Restrict` per approved lifecycle; never cascade a
  routine/training-program edit or deletion into historical performance.
- Historical `ExercisePerformance` uses the stable Exercise UUID. Exercise
  archival remains allowed, while hard deletion is restricted once history
  references the identity.

## Index plan

Start with indexes driven by endpoints:

- `Muscle(slug unique)`, `(bodyRegion, isActive)`, `(muscleGroupId, isActive)`, `parentId`
- `Exercise(slug unique)`, `(isActive, name)`, `(movementPatternId, isActive)`, `(skillLevel, isActive)`
- Join reverse lookups such as `ExerciseMuscle(muscleId, role)` and `ExerciseEquipment(equipmentId, exerciseId)`
- `Routine(ownerId, updatedAt)`, `Routine(ownerId, name)`, unique `(routineId, order)`
- `TrainingProgram(ownerId, updatedAt)`, `(ownerId, name)`, `(visibility, updatedAt)`, unique schedule slot `(trainingProgramId, weekNumber, dayNumber)`, and reverse routine schedule lookup
- Phase 8 session `(ownerId, startedAt)` plus status-aware active/history lookup
  indexes, and child foreign-key/order indexes driven by the approved queries

PostgreSQL does not automatically create useful indexes for every foreign key; add them explicitly. For search, begin with normalized `ILIKE`; enable `pg_trgm` and GIN indexes only through an intentional migration after query-plan measurement. Avoid indexing every rating column.

## Transactions and concurrency

Use Prisma transactions for aggregate writes: exercise plus joins/profiles,
routine plus ordered children, and routine-based workout start plus initial
`ExercisePerformance` prescription snapshots. Keep transactions short. Later
set mutations still resolve the owned `WorkoutSession` aggregate and preserve
child ordering/invariants. Image uploads are post-MVP and must not be introduced
into MVP aggregate transactions; if a later Cloudinary attachment workflow is
approved, define its consistency and cleanup behavior separately. Translate
known unique/foreign/check violations to stable 409/422 API errors.

Strength-set loads use an approved PostgreSQL decimal precision/scale, never a
floating-point column. Exact precision, canonical unit behavior, provenance
referential actions, and one-active-session/concurrency constraints are defined
by the Phase 8 migration. See
[workout sessions](14-workout-sessions.md).

Dense routine ordering can temporarily violate uniqueness during reorder. Use a delete/recreate strategy for child rows in a transaction, or a two-phase temporary offset update before canonical positions. Recommendation for small MVP arrays: validate references, delete existing children, bulk create desired children with stable/new IDs as appropriate in one transaction. If preserving child IDs matters, use offset updates.

Workout-session aggregate writes use optimistic concurrency from the first MVP
slice. Persist an integer `version`, load the owned aggregate, and update with
an `id`/`ownerId`/`version` condition. A stale write must return a stable
conflict rather than silently overwriting a recorded set. Other non-historical
resources may continue using last-write-wins until their own concurrency needs
justify versioning.

## Migrations

- Generate migrations locally, inspect SQL, and commit them.
- CI applies all migrations to a clean database and runs integration tests.
- Production uses `prisma migrate deploy`, never `db push`.
- After production launch, use expand/backfill/contract for breaking schema changes.
- Backfills are resumable and measured before deployment; do not hold long table locks unexpectedly.
- Never edit an already-applied migration; add a corrective migration.

## Seeding

Seeds are version-controlled manifests for muscle groups/muscles, equipment, and movement patterns. Use deterministic IDs or unique slugs and explicit upserts. Validate duplicates, hierarchy cycles, enum compatibility, and referenced parents before writes. Seeds do not delete absent production rows automatically; deactivation/removal is an explicit reviewed operation.

Separate small reference seeds from demo/development data. Production runs reference seeds only. Seed logs list changes without secrets and fail the deployment on invalid data.

## Prisma usage boundaries

Only the API imports Prisma client. Controllers never issue Prisma queries directly. Feature repositories/services expose projection-specific functions and always include ownership filters for user resources. Select only needed list fields and avoid broad nested `include` calls. Enable query logging only in safe development modes; production slow-query logging must redact parameters where needed.

## Testing and definition of done

Test clean migration, upgrade migration from the prior release, constraint failures, referential actions, seed rerun, transactions/rollback, ownership query behavior, and representative query plans. Done means a clean and prior-version database migrate safely, constraints match DTO rules, backup tooling recognizes the database, and no API route relies on unconstrained application-only assumptions.

## Open questions

Settle snake_case mapping, initial search extension, and production database location before foundation completion. Use application-assigned UUIDv4 identifiers, no trigram extension until search exists, and external managed PostgreSQL if budget/region supports reliable backups; otherwise Compose with strict operational safeguards.
