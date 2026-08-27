# Training programs and relative scheduling

## Purpose and current implementation boundary

A `TrainingProgram` is a reusable multi-week template that schedules existing
routine templates. The persistence model and migration are complete. The
Clean Architecture/DDD vertical slice currently implements list,
slug-based detail, authenticated create, owner-scoped update, and owner-scoped
delete. The corresponding frontend library, builder, list, and detail screens
are also implemented. Create and update persist the complete aggregate,
including its optional schedule, in one transaction. List supports the approved
visibility scopes, search, sorting, limit, and offset through a bounded read
projection. The routes are documented with Swagger. Seeds, adoption/progress,
calendar placement, and duplication are not part of the current template
slice. Workout-session history exists as a separate implemented feature.

The template hierarchy is:

```text
Exercise
   ↓
Routine
   ↓
TrainingProgram
```

The persisted relationship is:

```text
TrainingProgram
    ↓
TrainingProgramRoutine
    ↓
Routine
    ↓
RoutineExercise
    ↓
Exercise
```

A training program never contains exercises directly. `RoutineExercise` remains
the single owner of workout prescription details such as sets, rep ranges,
target RIR, rest, tempo, exercise order, and exercise notes. A
`TrainingProgramRoutine` only places a routine into the program and may attach
notes about that scheduled routine occurrence.

## Domain responsibilities and lifecycles

- **Exercise:** one curated movement identity. It does not prescribe a workout,
  schedule training, or record athlete performance.
- **Routine:** a reusable workout/session template containing ordered exercises
  and their prescription details.
- **Training Program:** a reusable multi-week template containing relative
  routine placements. It is not a user's active execution of a program and has
  no actual calendar dates.
- **Planned AdoptedTrainingProgram:** a user's adopted instance of a program. This
  layer will own adoption state and progress through a copied relative schedule.
  Calendar mapping and scheduled dates remain deferred.
- **Planned ProgramWorkoutOccurrence:** one copied workout occurrence from the adopted
  program schedule, with its own lifecycle and source snapshots.
- **WorkoutSession and ExercisePerformance:** implemented historical performed
  training. These models preserve what the athlete actually did rather than
  treating mutable templates as history.

The planned integrated execution hierarchy is intentionally separate:

```text
TrainingProgram
    ↓
AdoptedTrainingProgram
    ↓
ProgramWorkoutOccurrence
    ↓
WorkoutSession
    ↓
ExercisePerformance
    ↓
CompletedSet
```

The adopted-program models are not yet part of the current persistence schema.
Workout sessions already support standalone routines and freestyle workouts;
the next execution slice will add program-workout provenance without removing
those source modes. See [workout sessions](14-workout-sessions.md).

### Reusable template lifecycle

`TrainingProgram` is editable reusable prescription data. It has visibility and
ownership but no runtime progress status. Editing its name, duration, or
schedule changes the template only. It never pauses, completes, or advances,
and template changes do not mutate an already copied adopted schedule.

### Planned `AdoptedTrainingProgram` lifecycle

```text
ACTIVE
  ├──> PAUSED
  ├──> COMPLETED
  └──> CANCELLED

PAUSED
  ├──> ACTIVE
  └──> CANCELLED
```

- A newly adopted program starts as `ACTIVE`.
- `ACTIVE` and `PAUSED` are non-terminal; `COMPLETED` and `CANCELLED` are
  terminal.
- Only one non-terminal adopted program may exist per owner.
- The program becomes `COMPLETED` automatically when every occurrence is
  `COMPLETED` or `SKIPPED`.
- Starting or skipping an occurrence requires the parent program to be
  `ACTIVE`. A paused program cannot progress.
- Pausing or cancelling is rejected while an occurrence has an active
  `IN_PROGRESS` session. The user must complete or cancel that session first.
- Cancelling preserves the adopted program, its copied schedule, progress, and
  session attempts as history; it is not a hard delete.

### Planned `ProgramWorkoutOccurrence` lifecycle

```text
PENDING
  ├──> IN_PROGRESS
  └──> SKIPPED

IN_PROGRESS
  ├──> COMPLETED
  └──> PENDING
```

- `IN_PROGRESS -> PENDING` occurs only when the linked workout-session attempt
  is cancelled.
- `COMPLETED` and `SKIPPED` are terminal and cannot be started again through the
  normal workflow.
- An `IN_PROGRESS` occurrence cannot be skipped.
- The next occurrence is the first `PENDING` occurrence ordered by
  `weekNumber`, then `dayNumber`. The slot uniqueness constraint makes an ID
  tie-breaker unnecessary as a domain rule.
- Only the next pending occurrence may be started or skipped. A later occurrence
  cannot be started while an earlier one remains `PENDING`.
- If the next occurrence's source routine is unavailable, it remains `PENDING`
  until the user explicitly skips it or the source becomes available.

## Relative program scheduling

`TrainingProgramRoutine` schedules one routine at a relative `weekNumber` and
`dayNumber`. Day numbers describe training sequence within the week, not named
weekdays:

```text
Week 1
  Day 1 → Upper A
  Day 2 → Lower A
  Day 3 → Upper B
  Day 4 → Lower B
```

There is deliberately no Monday/Tuesday weekday enum. This keeps a template
independent of the user's calendar, timezone, travel, and preferred training
days. Actual dates and weekday mapping are not part of the initial
adopted-program slice and require a later, separately approved calendar
workflow.

`TrainingProgram.durationWeeks` stores the declared duration explicitly. Do not
derive program duration only from `MAX(weekNumber)`: a program may intentionally
contain an unscheduled week, and its declared contract should not change merely
because a schedule row changes.

The database prevents two routines from occupying the same slot with unique
`(trainingProgramId, weekNumber, dayNumber)`. The implemented domain and DTO
layers also validate integer values with these rules:

```text
weekNumber >= 1
weekNumber <= durationWeeks
dayNumber >= 1
durationWeeks >= 1
```

The existing schema has no general convention for positive-integer SQL checks,
so this slice does not introduce one-off raw check constraints. These rules must
be enforced by DTO/domain validation. A later repository-wide database
constraint policy may add matching checks through a
reviewed migration.

## Visibility, ownership, and copying

Training programs mirror the established routine-template visibility behavior
with a separate `TrainingProgramVisibility` enum:

```text
PRIVATE
GLOBAL
```

`PRIVATE` programs belong to users. `GLOBAL` programs are platform-provided
templates and remain owned by the protected platform/system user, following the
routine pattern. Keeping `RoutineVisibility` and `TrainingProgramVisibility`
separate avoids an unnecessary repository-wide rename and lets future policies
evolve independently.

A future duplicate-program operation creates a `PRIVATE` program owned by the
requesting user. When the source is `GLOBAL`, duplication must deep-copy every
referenced routine and its `RoutineExercise` prescriptions into independent
private routines, then schedule those copies in the private program. The copy
must not leave the user's program permanently dependent on mutable or removable
global routine templates. Duplication is not implemented in this slice.

Create derives `ownerId` from the authenticated principal and verifies every
attached routine in the same transaction. A private program may schedule a
GLOBAL routine or a PRIVATE routine owned by that principal. Missing routines
and private routines owned by another user produce the same generic 422 response
without disclosing whether the submitted slug exists.

## Referential actions and deletion

The schedule-to-routine relation uses `onDelete: Restrict`. Deleting a routine
that is referenced by any training program must fail; silently cascading or
removing a schedule row would unexpectedly change the program's prescribed
workouts. A future routine service should translate that foreign-key failure
into a clear domain error or introduce an approved archive workflow.

The schedule-to-program relation uses `onDelete: Cascade`. Deleting a training
program deletes only its owned `TrainingProgramRoutine` scheduling rows. It does
not delete routines, routine exercises, or exercises, because those are reusable
templates with independent ownership and lifecycles.

User deletion remains restricted through the program owner relation, matching
the current routine ownership policy and leaving account deletion to a future
explicit workflow.

## Approved adopted-program integration decisions

The next execution slice introduces `AdoptedTrainingProgram` and
`ProgramWorkoutOccurrence` without merging the template, routine, and workout-session
modules. The following decisions close the current design gaps before coding:

- Activating a program with no schedule rows is rejected. An empty template may
  remain valid while it is being authored, but it cannot become an active user
  program with no work to progress through.
- Pausing or cancelling an adopted program is rejected while one of its program
  workouts has an `IN_PROGRESS` session. The user must complete or cancel that
  session first. An `IN_PROGRESS` slot cannot be skipped.
- Cancelling a program-origin session preserves the cancelled session and
  atomically returns its `ProgramWorkoutOccurrence` to `PENDING`. Completion
  atomically completes the session, completes the occurrence, and completes the
  parent program when every occurrence is `COMPLETED` or `SKIPPED`.
- Program-workout launch is owned by a source-aware execution port in the new
  `adopted-training-programs` application layer. Its Prisma adapter creates the
  session snapshots and advances the occurrence in one transaction. The
  existing workout-session command port remains the owner of session completion
  and cancellation; its infrastructure contract is extended to propagate a
  linked occurrence and parent-program transition in the same transaction. This
  one-way ownership avoids circular NestJS module imports. The use cases must
  not call two repositories sequentially or make HTTP calls between local
  modules.

The copied `ProgramWorkoutOccurrence` schedule retains explicit name, week, day, and
notes snapshots. Routine prescriptions are resolved and snapshotted into
`ExercisePerformance` only when a session starts. If the source routine becomes
unavailable before a pending occurrence starts, the start command returns a
specific unavailable-source error and leaves the occurrence `PENDING`; the UI
must explain the problem and allow the user to skip that occurrence explicitly.
It must not silently start a later slot. This is the interim behavior until an
archive policy replaces the relevant hard-delete limitations.

## Implemented training-program template persistence model

```prisma
enum TrainingProgramVisibility {
  PRIVATE
  GLOBAL
}

model TrainingProgram {
  id            String                    @id @db.Uuid
  ownerId       String                    @db.Uuid
  slug          String                    @unique
  name          String
  description   String?
  visibility    TrainingProgramVisibility @default(PRIVATE)
  durationWeeks Int
  createdAt     DateTime                  @default(now()) @db.Timestamptz(3)
  updatedAt     DateTime                  @updatedAt @db.Timestamptz(3)

  owner    User                     @relation(fields: [ownerId], references: [id], onDelete: Restrict)
  routines TrainingProgramRoutine[]

  @@index([ownerId, updatedAt])
  @@index([ownerId, name])
  @@index([visibility, updatedAt])
}

model TrainingProgramRoutine {
  id                String @id @db.Uuid
  trainingProgramId String @db.Uuid
  routineId         String @db.Uuid
  weekNumber        Int
  dayNumber         Int
  notes             String?

  createdAt DateTime @default(now()) @db.Timestamptz(3)
  updatedAt DateTime @updatedAt @db.Timestamptz(3)

  trainingProgram TrainingProgram @relation(fields: [trainingProgramId], references: [id], onDelete: Cascade)
  routine         Routine         @relation(fields: [routineId], references: [id], onDelete: Restrict)

  @@unique([trainingProgramId, weekNumber, dayNumber])
  @@index([trainingProgramId, weekNumber, dayNumber])
  @@index([routineId])
}
```

IDs remain application-assigned UUIDs, matching `User`, `Routine`, and
`RoutineExercise`. Names remain camelCase in Prisma and PostgreSQL, timestamps
remain `timestamptz(3)`, and the owner/list indexes mirror the routine template
conventions.

The non-unique `(trainingProgramId, weekNumber, dayNumber)` index intentionally
matches the requested read-path convention even though the unique constraint
also creates a PostgreSQL unique index with the same leading columns. It can be
reconsidered later using query plans, but this slice preserves the approved
model exactly.

## Planned adopted-program persistence model

The following Prisma-like contract documents the approved design only. It does
not describe models that already exist in `schema.prisma`. `ownerId` is used
instead of `userId` to match the existing Routine, TrainingProgram, and
WorkoutSession ownership convention.

```prisma
enum AdoptedTrainingProgramStatus {
  ACTIVE
  PAUSED
  COMPLETED
  CANCELLED
}

enum ProgramWorkoutOccurrenceStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  SKIPPED
}

model AdoptedTrainingProgram {
  id                      String                    @id @db.Uuid
  ownerId                 String                    @db.Uuid
  sourceTrainingProgramId String?                   @db.Uuid
  programNameSnapshot     String
  durationWeeksSnapshot   Int
  status                  AdoptedTrainingProgramStatus @default(ACTIVE)
  startedAt               DateTime                  @db.Timestamptz(3)
  completedAt             DateTime?                 @db.Timestamptz(3)
  cancelledAt             DateTime?                 @db.Timestamptz(3)
  createdAt               DateTime                  @default(now()) @db.Timestamptz(3)
  updatedAt               DateTime                  @updatedAt @db.Timestamptz(3)

  owner                 User                     @relation(fields: [ownerId], references: [id], onDelete: Restrict)
  sourceTrainingProgram TrainingProgram?         @relation(fields: [sourceTrainingProgramId], references: [id], onDelete: SetNull)
  workouts              ProgramWorkoutOccurrence[]

  @@index([ownerId, status, updatedAt])
  @@index([sourceTrainingProgramId])
}

model ProgramWorkoutOccurrence {
  id                             String                   @id @db.Uuid
  adoptedTrainingProgramId       String                   @db.Uuid
  sourceTrainingProgramRoutineId String?                  @db.Uuid
  sourceRoutineId                String?                  @db.Uuid
  weekNumber                     Int
  dayNumber                      Int
  routineNameSnapshot            String
  programSlotNotesSnapshot       String?
  status                         ProgramWorkoutOccurrenceStatus @default(PENDING)
  createdAt                      DateTime                 @default(now()) @db.Timestamptz(3)
  updatedAt                      DateTime                 @updatedAt @db.Timestamptz(3)

  adoptedTrainingProgram       AdoptedTrainingProgram   @relation(fields: [adoptedTrainingProgramId], references: [id], onDelete: Restrict)
  sourceTrainingProgramRoutine TrainingProgramRoutine? @relation(fields: [sourceTrainingProgramRoutineId], references: [id], onDelete: SetNull)
  sourceRoutine                Routine?               @relation(fields: [sourceRoutineId], references: [id], onDelete: SetNull)
  sessionAttempts              WorkoutSession[]

  @@unique([adoptedTrainingProgramId, weekNumber, dayNumber])
  @@index([adoptedTrainingProgramId, weekNumber, dayNumber])
  @@index([adoptedTrainingProgramId, status, weekNumber, dayNumber])
  @@index([sourceTrainingProgramRoutineId])
  @@index([sourceRoutineId])
}

model WorkoutSession {
  // Existing fields remain.
  programWorkoutOccurrenceId String?                  @db.Uuid
  programWorkoutOccurrence   ProgramWorkoutOccurrence? @relation(fields: [programWorkoutOccurrenceId], references: [id], onDelete: SetNull)

  @@index([programWorkoutOccurrenceId])
}
```

The attempt cardinality is deliberately one-to-many:

```text
ProgramWorkoutOccurrence 1 ─── N WorkoutSession
```

An occurrence has zero attempts before first start, one current attempt while
`IN_PROGRESS`, any number of preserved cancelled attempts, and at most one
completed attempt. `WorkoutSession.programWorkoutOccurrenceId` must not be unique.
Conditional occurrence transitions are the primary concurrency control. The
implementation should additionally use reviewed PostgreSQL partial unique
indexes to reinforce at most one `IN_PROGRESS` attempt and at most one
`COMPLETED` attempt per non-null occurrence.

Prisma cannot declare the required partial unique indexes directly. The planned
implementation must create them in a reviewed PostgreSQL migration. Their
semantic form is:

```sql
CREATE UNIQUE INDEX "AdoptedTrainingProgram_one_non_terminal_per_owner_idx"
ON "AdoptedTrainingProgram" ("ownerId")
WHERE "status" IN ('ACTIVE', 'PAUSED');

CREATE UNIQUE INDEX "WorkoutSession_one_in_progress_per_program_workout_idx"
ON "WorkoutSession" ("programWorkoutOccurrenceId")
WHERE "programWorkoutOccurrenceId" IS NOT NULL AND "status" = 'IN_PROGRESS';

CREATE UNIQUE INDEX "WorkoutSession_one_completed_per_program_workout_idx"
ON "WorkoutSession" ("programWorkoutOccurrenceId")
WHERE "programWorkoutOccurrenceId" IS NOT NULL AND "status" = 'COMPLETED';
```

The exact generated identifiers may be chosen during implementation. Source
template relations use `SetNull`; deleting a template must never cascade into an
adopted program, occurrence, session, performance, or completed set. Adopted
programs and occurrences are completed, skipped, or cancelled rather than
normally hard-deleted. The owner relation remains restrictive until the
separate account export/deletion/retention policy defines an explicit purge.

### Snapshot stages and authority

Activation copies the program name, declared duration, week number, day number,
routine name, program-slot notes, and nullable provenance IDs into the adopted
program and occurrences. Later template schedule edits do not rewrite those
values.

The adopted schedule is stable after activation, but the routine prescription
remains live until its occurrence starts. At start, the current routine is
resolved and copied into ordered `ExercisePerformance` rows with:

- stable exercise UUID;
- exercise-name snapshot;
- exercise order;
- target set count;
- minimum and maximum repetitions;
- target RIR;
- rest duration;
- tempo;
- prescription notes.

After start, the `ExercisePerformance` snapshot is the historical authority.
Broader program/template versioning remains deferred.

## Future extensibility without premature hierarchy

Independent `(weekNumber, dayNumber)` rows already allow different routines on
different weeks, deload weeks, exercise-selection changes between blocks (by
referencing different routine templates), and different numbers of training
days across weeks. The MVP therefore does not need:

```text
TrainingProgram
→ ProgramPhase
→ ProgramWeek
→ ProgramDay
→ Routine
```

`ProgramPhase`, `ProgramWeek`, and `ProgramDay` should be introduced only if a
concrete future workflow requires metadata or behavior at those levels.
Adopted-program execution is the separate planned aggregate described above,
not part of the reusable template aggregate. Weekday enums, direct program
exercises, progression rules, percentage-based loading, mesocycles,
`daysPerWeek`, and frontend-specific fields remain outside the current design.

## Backend architecture

Training Programs established the architecture now also used by Routines and
described in [Architecture](02-architecture.md). It remains one NestJS feature
module in the modular monolith; the vertical slice is organizational and
dependency-oriented, not a microservice boundary.

```text
apps/api/src/modules/training-programs/
  domain/
    entities/
      training-program.entity.ts
      training-program.types.ts
      training-program-schedule-entry.entity.ts
    errors/
      training-program.errors.ts
  application/
    ports/
      training-programs-command.port.ts
      training-programs-query.port.ts
    use-cases/
      commands/
        create-training-programs.use-case.ts
        update-training-program.use-case.ts
        delete-training-program.use-case.ts
      queries/
        list-training-programs.use-case.ts
        get-training-program.use-case.ts
    models/
      create-training-program.input.ts
      detail-training-program.model.ts
      list-training-programs.model.ts
      update-training-program.input.ts
  infrastructure/
    prisma/
      prisma-training-programs.adapter.ts
      prisma-training-program.mapper.ts
  presentation/
    dto/
    training-programs.controller.ts
    training-programs-exception.mapper.ts
  training-programs.module.ts
```

This is the current organization. Future modules should still add a file only
when the implementation gives it a concrete responsibility.

### Layer responsibilities

- The domain layer owns schedule-slot uniqueness, duration bounds, normalized
  program state, and mutation rules. It has no NestJS or Prisma imports.
- The application layer owns one use case per supported action, receives the
  authenticated principal as trusted context, and coordinates domain and
  repository contracts.
- The infrastructure layer owns Prisma queries, projections, relation mapping,
  and transactions. Prisma-generated types never appear in domain,
  application, or HTTP contracts.
- The presentation layer owns route decorators, authentication decorators,
  class-validator/class-transformer request DTOs, Swagger response DTOs, and
  HTTP error translation.
- `training-programs.module.ts` is the composition root for this feature. It
  imports `SharedDatabaseModule`; shared authentication, configuration, and
  database infrastructure is composed by `SharedInfrastructureModule`.

The Training Programs aggregate and schedule-entry entity use the shared
domain `Entity` and `UniqueId` primitives. Their primitive persistence models
remain string-based at the infrastructure boundary.

The repository ports are feature-specific rather than generic and belong to the
application boundary. The command port persists the complete aggregate
atomically and guarantees that referenced routines are resolved and revalidated
in the same Prisma transaction. Query use cases may use purpose-built
list/detail projections instead of hydrating an aggregate that will not be
mutated. This is pragmatic command/query separation without a CQRS library,
event bus, or additional dependency. The domain layer contains entities and
invariants only; it does not know about persistence ports.

The implemented slice follows these paths:

```text
HTTP controller
  → ListTrainingProgramsUseCase
  → TrainingProgramsQueryPort (application read port)
  → PrismaTrainingProgramsAdapter
  → Prisma mapper
  → lightweight list projection
```

The create path uses the application `TrainingProgramsCommandPort` command port. It
derives `ownerId` from the principal, always creates a PRIVATE program, resolves
eligible routine slugs, and inserts the parent and schedule children atomically.
The aggregate owns schedule invariants and canonical ordering. The GET uses
`@OptionalAuth()` so GLOBAL reads can remain public; the default `my` scope
still requires a valid principal in the application layer.

The current create factory delegates name, description, duration, slug, and ID
normalization/generation to dedicated immutable domain value objects. The
factory coordinates those objects and assembles the entity; it does not own
their validation rules directly.

### Aggregate boundary

`TrainingProgram` is the aggregate root. Its schedule entries are children, not
independently addressable resources. The aggregate enforces:

- `durationWeeks >= 1`;
- every `weekNumber` is between 1 and `durationWeeks`;
- every `dayNumber >= 1`;
- no duplicate `(weekNumber, dayNumber)` slot;
- deterministic schedule ordering by `weekNumber`, then `dayNumber`;
- reducing duration cannot leave entries beyond the new duration.

The schedule child entity owns occurrence identity, routine reference, notes,
and timestamps. A schedule-slot value object owns positive integer week/day
validation and its compound identity; the aggregate applies duration bounds and
cross-entry uniqueness.

The aggregate references routines; it never embeds routine prescriptions or
exercise data. HTTP/application commands use `routineSlug` as the stable
external identifier. The Prisma adapter resolves it to `Routine.id` when
persisting `TrainingProgramRoutine` rows.

## Implemented training-program template API

The implemented operations are:

```text
GET /api/training-programs
GET /api/training-programs/:slug
POST /api/training-programs
PATCH /api/training-programs/:slug
DELETE /api/training-programs/:slug
```

GET accepts the approved `scope`, `q`, `sort`, `limit`, and `offset` parameters.
POST accepts `name`, `description`, `durationWeeks`, optional `slug`, and an
optional `schedule` that defaults to an empty array. Identity, owner,
visibility, and timestamps are server-controlled. Whether supplied or omitted,
the slug base is normalized and gets an eight-character UUID suffix.

### Template use cases

1. `CreateTrainingProgram`: create one private owned template and its complete
   schedule atomically.
2. `ListTrainingPrograms`: list either the caller's private templates or global
   templates with search, sorting, limit, and offset.
3. `GetTrainingProgram`: return an accessible private/global template and its
   ordered schedule with routine summaries.
4. `UpdateTrainingProgram`: update an owned PRIVATE template. Name,
   description, and duration are optional patch fields; omitted values are
   preserved. A supplied schedule replaces the complete schedule, including
   an empty array to clear it. The slug is immutable and the parent plus child
   rows are persisted atomically.
5. `DeleteTrainingProgram`: delete an owned private template; database cascade
   removes only its schedule rows.

Global program creation/editing, duplication, adopted-program execution,
archive state, and calendar placement are excluded from the implemented
template API. The approved adopted-program contract is documented separately
below.

### HTTP routes

```text
POST   /api/training-programs
GET    /api/training-programs?scope=my|global&q=&sort=&limit=&offset=
GET    /api/training-programs/:slug
PATCH  /api/training-programs/:slug
DELETE /api/training-programs/:slug
```

Routes use immutable program slugs rather than UUID path parameters, matching
the Routine API. `ownerId`, `visibility`, IDs, and timestamps are never
accepted from mutation bodies. Create generates an application-assigned UUID
and appends an eight-character UUID suffix to the normalized supplied slug or
name base. Renaming a program does not change its slug.

### Proposed request contracts

Create:

```json
{
  "name": "Upper/Lower Four Day",
  "description": "Four training days across four weeks.",
  "durationWeeks": 4,
  "schedule": [
    {
      "routineSlug": "upper-a-1234abcd",
      "weekNumber": 1,
      "dayNumber": 1,
      "notes": null
    }
  ]
}
```

Patch accepts any of `name`, `description`, `durationWeeks`, or `schedule`.
Omitted fields remain unchanged. Explicit `description: null` clears the
description. When `schedule` is present, it replaces the complete child
collection; partial child updates and schedule-entry endpoints are not part of
the first slice. Validation applies to the resulting aggregate, so changing
duration without submitting schedule still fails if existing entries would be
out of range.

The recommended validation contract is:

- name: trimmed, 2–120 characters;
- description: optional/null, trimmed, at most 2,000 characters;
- duration: integer at least 1, with no invented product maximum yet;
- schedule: an array, with an empty array allowed for an intentionally
  unscheduled template;
- routine slug: trimmed, 1–120 characters;
- week/day: integers with the aggregate bounds above;
- notes: optional/null, trimmed, at most 1,000 characters;
- duplicate slots: rejected before persistence with a field-addressable error.

Global request body size limits remain the technical protection against
unbounded payloads until product requirements justify a schedule-entry maximum.

### Proposed response contracts

List returns a plain array with `limit`
defaulting to 20, maximum 100, and `offset` defaulting to 0. Allowed sorts are
`updatedAt:asc|desc` and `name:asc|desc`; default is `updatedAt:desc`. List rows
contain only `slug`, `name`, `description`, `visibility`, `durationWeeks`, and
`updatedAt`. They deliberately omit internal IDs, `ownerId`, schedule content,
routine counts, and creation timestamps.

Detail returns an ordered `schedule` array. Each entry contains `weekNumber`,
`dayNumber`, `notes`, and a routine summary with `slug`, `name`, and
`visibility`. Internal IDs and owner IDs are excluded. Exercise prescriptions
remain behind the Routine API and are not duplicated into the program response.

Mutations follow the existing feedback-only convention:

```json
{
  "message": "Training program created successfully",
  "slug": "upper-lower-four-day-1234abcd"
}
```

### Proposed visibility and authorization

- `scope=my` requires authentication and returns only private programs whose
  `ownerId` equals the principal user ID.
- `scope=global` and global detail are anonymously readable.
- Private detail is readable only by its owner; another user's program returns
  the same 404 as a missing slug.
- Create always produces `PRIVATE`; the client cannot choose visibility or
  owner.
- Update/delete require the authenticated owner and `PRIVATE` visibility.
- The first slice has no normal-user write path for `GLOBAL` programs.
- Repository queries include ownership/visibility predicates; use cases do not
  fetch an unscoped private record and authorize it afterward.

A private program may reference GLOBAL routines from the KinetiQ library and
PRIVATE routines owned by the same user. It may not reference another user's
PRIVATE routine. This direct global reference is intentional for manually
created private programs. It does not change the separate future duplication
rule: duplicating a GLOBAL program must deep-copy its routines so the duplicate
is independent.

When any submitted routine is missing, inaccessible, or otherwise ineligible,
return one generic 422 error such as “One or more scheduled routines are
unavailable.” Field errors may identify schedule indexes but must not disclose
another user's private routine.

### Persistence and transaction behavior

- Create resolves every unique routine slug and creates the parent/children in
  one transaction.
- Update first resolves the owned private program inside the transaction. If a
  schedule replacement is present, validate routine eligibility, delete current
  schedule rows, and create the canonical ordered replacement in that same
  transaction.
- Empty replacement uses `deleteMany` without `createMany`.
- List/detail use bounded projections and select only fields in the documented
  response.
- Delete constrains slug, owner, and private visibility. Program cascade removes
  schedule rows only.
- Reject duplicate slots found in the submitted aggregate as 422. Translate a
  database unique-slot race to 409; no partial aggregate may remain.

The existing Routine delete path must translate a `TrainingProgramRoutine`
foreign-key restriction into a stable 409 conflict instead of a generic 500.
That is a small cross-feature integration change required when this backend
slice ships; it does not change the restrictive database rule.

### Error boundaries

Domain/application errors contain stable codes and safe context but never extend
NestJS HTTP exceptions. The presentation mapper translates them to the existing
API problem/error conventions:

- unauthenticated mutation or `scope=my`: 401;
- missing or concealed inaccessible private program detail: 404;
- invalid aggregate or unavailable routine reference: 422;
- persistence uniqueness/state conflict: 409;
- unexpected repository failure: 500 without SQL or sensitive payloads.

Do not log session tokens, full mutation payloads, private notes, or Prisma
errors containing sensitive parameters.

## Planned adopted-program application and API contract

### Adopted-program use cases

The planned `adopted-training-programs` feature exposes transport-neutral use
cases with owner identity supplied by the authenticated principal:

```text
ActivateTrainingProgram
GetActiveAdoptedTrainingProgram
GetAdoptedTrainingProgram
PauseAdoptedTrainingProgram
ResumeAdoptedTrainingProgram
CancelAdoptedTrainingProgram
StartProgramWorkoutOccurrence
SkipProgramWorkoutOccurrence
```

Activation accepts an accessible `GLOBAL` template or a `PRIVATE` template
owned by the principal. Another user's private template remains concealed as
not found. Activation rejects an empty schedule and atomically creates the
`ACTIVE` adopted program plus every copied occurrence. Owner IDs are never
accepted from request bodies, and occurrence commands resolve through the owned
`AdoptedTrainingProgram` rather than authorizing a child ID independently.

### Canonical routes

Every route requires authentication and uses UUID parameters for adopted
resources:

```text
POST /api/user-training-programs
GET  /api/user-training-programs/active
GET  /api/user-training-programs/:id
POST /api/user-training-programs/:id/pause
POST /api/user-training-programs/:id/resume
POST /api/user-training-programs/:id/cancel
POST /api/user-training-programs/:id/workouts/:occurrenceId/start
POST /api/user-training-programs/:id/workouts/:occurrenceId/skip
```

Activation receives only the source program slug. Lifecycle actions need no
owner or status fields in their bodies. Program-workout start receives the
session timezone and an optional explicit start timestamp under the same rules
as the existing workout-session API. `occurrenceId` deliberately distinguishes
the copied program occurrence from the resulting `WorkoutSession` ID.

Activation returns `201` with the adopted-program ID, `ACTIVE` status, and
`startedAt`. Program lifecycle and skip commands return `200` with the affected
resource ID, resulting status, and `updatedAt`; clients then refetch the active
read model. Start returns `201` with `workoutSessionId`, `occurrenceId`, session
status, and occurrence status.

`GET /active` returns `200` with the non-terminal adopted-program read model or
`null` when none exists, matching the existing active-workout read convention.
`GET /:id` includes terminal history and returns concealed `404` for missing or
unowned IDs.

### Active-program read model

The active/detail response must expose policy results rather than requiring the
frontend to reconstruct them:

```ts
type AdoptedTrainingProgramDetail = {
  id: string;
  programNameSnapshot: string;
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
  durationWeeksSnapshot: number;
  startedAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  totalCount: number;
  completedCount: number;
  skippedCount: number;
  resolvedCount: number;
  progressPercent: number;
  occurrences: ProgramWorkoutOccurrenceDetail[];
  nextPendingOccurrence: ProgramWorkoutOccurrenceDetail | null;
  actions: {
    canPause: boolean;
    canResume: boolean;
    canCancel: boolean;
    canStartNext: boolean;
    canSkipNext: boolean;
  };
};

type ProgramWorkoutOccurrenceDetail = {
  id: string;
  weekNumber: number;
  dayNumber: number;
  routineNameSnapshot: string;
  programSlotNotesSnapshot: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED";
  sourceRoutineAvailable: boolean;
  sessionAttemptIds: string[];
  activeSessionId: string | null;
  latestSessionId: string | null;
};
```

`resolvedCount` equals `completedCount + skippedCount`, and
`progressPercent = resolvedCount / totalCount * 100`. Completed and skipped
counts remain separate so progress never presents skipped work as completed
work. The server selects `nextPendingOccurrence` by week/day order and computes
all action flags. The client must not independently decide which occurrence is
next or whether a lifecycle action is legal.

Workout-session detail and history read models add an explicit source kind:
`FREESTYLE`, `ROUTINE`, or `PROGRAM_WORKOUT`. Program-origin rows expose the
adopted-program ID, program-name snapshot, week/day snapshots, occurrence ID,
and routine-name snapshot from the preserved adopted schedule. Mutable source
template names are never the historical authority.

### Atomic application-port operations

Each cross-aggregate command must be persisted through exactly one atomic
application-port operation. Business transitions and required conditional
states are explicit in the application contracts and domain model; the Prisma
adapters execute them but do not invent hidden lifecycle policy.

`StartProgramWorkoutOccurrence` is owned by a source-aware execution port in the planned
`adopted-training-programs` application layer. Its infrastructure adapter must
atomically:

1. verify the principal owns the adopted program;
2. require the parent program to be `ACTIVE`;
3. verify the occurrence is the next `PENDING` occurrence;
4. verify no other active workout session exists for the owner;
5. resolve the source routine and active exercises;
6. create the `WorkoutSession`;
7. create ordered `ExercisePerformance` prescription snapshots;
8. associate the session with the occurrence;
9. conditionally transition the occurrence to `IN_PROGRESS`.

No partial session or occurrence transition may remain if any step fails.

Completion and cancellation remain owned through explicit operations on the
existing workout-session command-side application contract. They must not be
implemented as surprising side effects of its generic aggregate `update()`
method. The completion operation atomically:

1. conditionally completes the owned `WorkoutSession` using its expected
   version;
2. transitions the linked occurrence from `IN_PROGRESS` to `COMPLETED`;
3. transitions the parent program from `ACTIVE` to `COMPLETED` if every
   occurrence is now `COMPLETED` or `SKIPPED`.

The cancellation operation atomically:

1. conditionally cancels the owned `WorkoutSession` using its expected version;
2. preserves the cancelled session and recorded facts;
3. transitions the linked occurrence from `IN_PROGRESS` back to `PENDING`;
4. leaves the parent program `ACTIVE` so it can be paused or cancelled through
   a separate explicit command.

`SkipProgramWorkoutOccurrence` conditionally skips only the next `PENDING` occurrence of
an `ACTIVE` program and completes the parent when no unresolved occurrence
remains. Pause and program cancellation conditionally verify that no linked
occurrence has an active session. Every race loses with a stable concurrency or
lifecycle conflict and leaves no partial state.

This design intentionally lets the relevant Prisma adapters participate in one
cross-feature database transaction while application and domain layers remain
free of Prisma. Do not introduce a distributed transaction, event bus, NestJS
CQRS bus, local HTTP call, circular NestJS module import, or generic Unit of Work
without a demonstrated need.

### Authorization and errors

- Missing authentication returns `401`.
- A missing adopted program, another owner's adopted program, another owner's
  private source template, or a child occurrence outside the owned parent
  returns the same concealed `404`.
- Transport validation errors return the repository-standard `400` response.
- Empty-program activation and unavailable routine source return `422` with a
  stable application error code. Unavailable start leaves the occurrence
  `PENDING` and enables explicit skip only when it is still the next occurrence.
- An existing `ACTIVE` or `PAUSED` program, an existing active workout, invalid
  lifecycle transition, stale version/conditional update, duplicate start, or
  start/skip race returns `409` with a stable conflict code.
- Persistence errors never expose Prisma metadata, SQL, private notes, or source
  ownership details.

## Testing requirements for the backend slice

- Domain: duration, week/day bounds, duplicate slots, canonical ordering,
  duration reduction, empty schedule, and patch state transitions.
- HTTP DTO: trimming, nullable fields, nested validation, integer boundaries,
  unknown fields, and duplicate-slot error paths.
- Use cases: principal propagation, scope rules, concealed access, immutable
  slug, feedback responses, and repository error mapping.
- Mapper: Prisma/domain/read-model mapping and schedule ordering.
- Prisma integration: atomic create/replacement rollback, routine eligibility,
  owner-scoped reads/writes, slot uniqueness, program cascade, and routine
  deletion restriction.
- API E2E: anonymous global reads, authenticated private lifecycle, two-user
  isolation, unavailable routine references, invalid schedules, and routine
  delete conflict.
- Architecture: domain/application files have no imports from NestJS, Prisma,
  Swagger, or presentation DTOs.

Do not add placeholder “is defined” tests. Each test must prove behavior at the
cheapest appropriate layer.

The planned adopted-program slice additionally requires domain lifecycle and
next-occurrence tests; application authorization and transition tests; real
PostgreSQL partial-index, conditional-update, concurrency, rollback, and
referential-action tests; API ownership and complete-journey tests; and frontend
active-program, session-context, retry, skip, and progress tests. The exhaustive
scenario list and browser critical path are maintained in
[testing strategy](16-testing-strategy.md).

## Implemented template-slice sequence and verification

The reusable template domain, application, Prisma, HTTP, and frontend slices are
implemented. Their original sequence is historical rather than instructions for
new work. Do not seed training programs merely to satisfy the adopted-program
slice.

The routine delete path still does not translate a
`TrainingProgramRoutine` foreign-key restriction into the intended stable
template-in-use `409`; it currently maps the persistence failure through the
exercise-unavailable path. Do not claim that integration fix is implemented
until repository code and a regression test prove it.

The next implementation sequence is the Phase 8.5 adopted-program integration
described in [workout sessions](14-workout-sessions.md).

## Deferred decisions

Global-program administration, coach-assigned programs, routine/program
archival, broader program versioning, account-data retention/deletion, calendar
mapping, and routine/program progression recommendations remain deferred in
[open decisions](24-open-decisions.md). They do not block the approved
adopted-program slice.
