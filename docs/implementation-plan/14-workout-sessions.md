# Workout sessions and performance recording

## Purpose and status

Phase 8 will introduce the historical execution domain. It is planned and is
not implemented in the current Prisma schema or API. This document is the
architectural source of truth for that implementation.

Use these concrete domain names consistently:

```text
WorkoutSession
    └── ExercisePerformance
            └── CompletedSet
```

`WorkoutSession` is one actual workout performed by one authenticated user.
`ExercisePerformance` is one exercise performed within that occurrence, and
`CompletedSet` is the lowest-level raw historical performance fact. Product
copy may use “training session” conversationally, but the model is not named
`TrainingSession`.

Phase 8 supports strength/repetition-based training first. Duration, distance,
pace, velocity, power, calories, wearables, and other modality-specific records
are later work.

## Prescription and execution are separate domains

The implemented prescription hierarchy is:

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

The planned execution hierarchy is:

```text
WorkoutSession
    ↓
ExercisePerformance
    ↓
CompletedSet
```

A `RoutineExercise` describes reusable intent. An `ExercisePerformance`
describes what was prescribed and performed in one historical workout. It is
therefore more than a join row:

```text
RoutineExercise
      │
      │ prescription snapshot when a routine-based workout starts
      ▼
ExercisePerformance
```

For example, an exercise performance may preserve this combination:

```text
Bench Press

Prescribed:
3 sets
8–10 reps
RIR 2
120 sec rest

Performed:
100 × 10 @2
100 × 9 @1
100 × 8 @0
```

The prescription snapshot, not the current mutable `RoutineExercise`, is the
authority for history. If an August 20 prescription was `3 × 8–10 @ RIR 2` and
the routine is changed on September 1 to `4 × 5–6 @ RIR 1`, the August 20
session must still expose `3 × 8–10 @ RIR 2`.

The initial snapshot should preserve the relevant values that exist today:

- target set count;
- minimum and maximum repetitions;
- target RIR;
- rest duration;
- tempo;
- prescription notes when useful;
- exercise ordering and an exercise-name snapshot for readable history.

Nullable provenance relations to the source routine, routine exercise, and
exercise may support navigation and audit. They must never be the source of
historical prescription values. Do not serialize an entire Prisma record as a
snapshot. Frequently queried prescription facts should use deliberately named
fields; any supplementary versioned snapshot payload must have a concrete need.

## Sources and active training programs

A workout session may originate from:

- a standalone routine;
- a future active/adopted training program;
- a freestyle workout.

The long-term relationship remains:

```text
TrainingProgram
      ↓
ActiveProgram / UserTrainingProgram
      ↓
WorkoutSession
```

`TrainingProgram` is a reusable template. `ActiveProgram` /
`UserTrainingProgram` is a future user adoption and calendar-mapping concept.
Phase 8 must not require that future layer first: a `WorkoutSession` can exist
independently, and its source/provenance is optional according to how it was
started. Actual calendar dates belong to this execution/adoption side, not to
the relative week/day schedule of a training-program template.

## Aggregate and lifecycle

`WorkoutSession` is the initial aggregate root:

```text
WorkoutSession
    ├── ExercisePerformance
    │       ├── CompletedSet
    │       └── CompletedSet
    │
    └── ExercisePerformance
            └── CompletedSet
```

Commands mutate `ExercisePerformance` and `CompletedSet` through the owned
`WorkoutSession` aggregate. They are not independent user-owned aggregate
roots and should not have authorization based only on a client-supplied child
ID. Conceptual commands are:

```text
StartWorkout
AddExercise
RemoveExercise
RecordSet
UpdateSet
DeleteSet
CompleteWorkout
CancelWorkout
```

Keep the first lifecycle small:

```text
IN_PROGRESS
    ├──→ COMPLETED
    └──→ CANCELLED
```

Starting a workout creates it in `IN_PROGRESS`. Completion and cancellation
are deliberate domain transitions, not generic status patches. Normal exercise
and set mutations are permitted only while the session is `IN_PROGRESS`.
Completed and cancelled sessions reject normal new performance data. A later
correction path for completed history must be explicit, authorized, and audited;
its exact policy is a decision required before exposing corrections.

Core invariants include:

- ownership always comes from the authenticated principal, never a request
  body;
- a child mutation first resolves the owned workout-session aggregate;
- sets cannot be recorded against another user’s session;
- exercise and set ordering is valid and unique within its parent;
- repetitions are non-negative integers;
- external load is non-negative and stored in a database decimal type, never a
  binary floating-point type;
- RIR is optional and, while KinetiQ uses its current prescription convention,
  is an integer from 0 through 10;
- a completion timestamp cannot precede the session start;
- a session transition cannot silently discard or rewrite recorded history.

Warm-up classification is useful for strength analytics, but whether the first
`CompletedSet` includes an `isWarmup` fact remains a pre-schema decision. Do not
introduce a larger set-status hierarchy merely to support it.

## Historical-data and identity rules

Completed workouts are historical records, not ordinary unrestricted CRUD.
Editing a routine or training program must never update prior sessions. Exercise
archival must not invalidate history, and an exercise referenced by historical
performance must not be hard-deleted.

New `ExercisePerformance` records reference `Exercise` by its stable internal
UUID. Exercise slugs remain useful public/editorial identifiers, but they are
not the historical identity. This decision does not require an immediate change
to the implemented `RoutineExercise.exerciseSlug`; launch logic resolves the
current routine reference to the stable exercise identity when creating the
performance snapshot.

Source relations need referential actions that preserve completed history. A
source template may be archived, renamed, or otherwise changed without cascading
into its snapshots or completed sets. Account deletion, historical correction,
and retention need explicit product policies before production launch.

## Clean Architecture module boundary

The implemented `routines` and `training-programs` modules use feature-local
`application`, `domain`, `infrastructure`, and `presentation` layers with
separate command/query ports and Prisma adapters. `WorkoutSessionsModule` should
follow that established architecture:

```text
apps/api/src/modules/workout-sessions/
    application/
        ports/
        use-cases/
            commands/
            queries/
    domain/
    infrastructure/
        prisma/
    presentation/
    workout-sessions.module.ts
```

This is an intended boundary, not authorization to create empty files or a CQRS
framework. The command side coordinates aggregate transitions and transactional
writes. The query side returns purpose-built read models and can grow specialized
history projections without forcing analytics concerns into the domain write
model. Initial conceptual queries are:

```text
GetActiveWorkout
GetWorkout
ListWorkoutHistory
GetExerciseHistory
```

Prisma types remain inside infrastructure. HTTP DTOs and authentication
decorators remain inside presentation. The application layer owns transport-
neutral use cases and ports, while the domain owns lifecycle and value
invariants.

## Phase 8 usable vertical slice

### Database and domain

- `WorkoutSession`, `ExercisePerformance`, and `CompletedSet`;
- only the small enums and value objects needed by the approved lifecycle and
  strength/repetition facts;
- owner, stable exercise identity, optional source provenance, prescription
  snapshots, ordering, timestamps, and supporting indexes/constraints;
- decimal external loads and no duration/distance modality fields yet.

### API and application behavior

- start a freestyle or routine-based workout;
- add or remove an exercise while appropriate;
- record, update, and delete sets while the session is mutable;
- complete or cancel a workout through explicit transitions;
- retrieve the active workout and one historical workout;
- list workout history;
- retrieve history for an exercise.

Starting from a routine should create the `WorkoutSession` and its initial
ordered `ExercisePerformance` prescription snapshots atomically where practical.
Recording or mutating a child must preserve aggregate ownership and the relevant
transaction boundary.

### Mobile-first product behavior

The primary Phase 8 workflow occurs on a phone during active training. The UI
should prioritize few taps, large touch targets and load/repetition inputs,
one-handed operation where practical, strong contrast, minimal navigation,
visible current exercise and prescription, quick exercise switching, obvious
set completion, and easy correction of a recently entered set. A finish action
needs a clear review/summary step.

Rest-timer integration may be optional but must not block logging. The active
workout should survive navigation or reload where technically feasible. Full
offline-first synchronization remains later work because conflict handling and
idempotency require a separate design.

## Raw facts and future analytics

Workout sessions store observations and historical context:

```text
completed sets
load
repetitions
RIR
timestamps
session context
prescription snapshots
```

They do not persist every value that can initially be derived reliably. Keep
these categories distinct:

- **Deterministic derived metrics:** training volume, completed-set count,
  session frequency, exercise frequency, and consistency.
- **Heuristic estimates:** estimated 1RM, muscle-set equivalents, and fatigue
  exposure. These require named/versioned methods and visible assumptions.
- **Recommendations:** later progression, load/repetition, or recovery-related
  suggestions based on sufficient data.

Phase 9 begins only after Phase 8 provides stable, trustworthy history. Initial
analytics remain completed sessions, consistency, volume, estimated 1RM, PR
detection, exercise frequency, and basic muscle-set estimates. Materialized
analytics tables are deferred until measured query performance justifies them;
any later cache/materialization must be rebuildable from raw history and
versioned where appropriate.

Future muscle analytics can follow:

```text
CompletedSet
    ↓
ExercisePerformance
    ↓
Exercise
    ↓
ExerciseMuscle
```

Possible outputs include primary/secondary muscle exposure, weekly training
distribution, movement-pattern distribution, and weighted set exposure.
Exercise-muscle involvement is an editorial heuristic, not physiological
precision. Prefer “muscle exposure,” “weighted set exposure,” “training
distribution,” or “estimated muscle-set equivalents” over an unqualified
“effective sets,” and expose the method and assumptions where appropriate.

## Testing requirements

- domain tests for lifecycle transitions, ordering, repetitions/load/RIR, and
  completion timing;
- use-case tests for authenticated ownership propagation, child mutation through
  the aggregate, and transaction orchestration;
- Prisma integration tests for decimal precision, ordering constraints, owner-
  scoped reads/writes, atomic routine launch, and referential actions;
- API negative authorization tests proving one user cannot discover or mutate
  another user’s session, performance, or set;
- snapshot immutability tests proving routine edits do not change prior sessions;
- archival tests proving an exercise remains resolvable in history and cannot be
  hard-deleted while referenced;
- persistence and query tests for active workout, workout history, and exercise
  history;
- migration verification from both a clean database and the current schema;
- mobile component/E2E tests for rapid set entry, recent correction, reload/
  navigation continuation, completion review, and interrupted requests.

Concurrency and retry tests must cover duplicate completion and obvious
duplicate-set creation once the idempotency/concurrency contract is approved.

## Implementation sequence after approval

1. Resolve the pre-schema decisions below and approve the exact persistence/API
   contract.
2. Implement and test the domain aggregate, lifecycle, prescription snapshot,
   and strength-set value objects.
3. Add command/query use cases and ports, including owner-isolation tests.
4. Add the Prisma schema/migration, mapper, adapter, constraints, indexes, and
   real PostgreSQL integration tests.
5. Add presentation DTOs, error mapping, Swagger contracts, and API E2E tests.
6. Build the mobile-first active-workout vertical slice and history reads.
7. Verify clean/current migrations, lint, type checks, all relevant tests, and
   production builds before beginning Phase 9.

## Decisions required before implementation

The following remain deliberately unresolved and require approval before the
schema or API is designed:

1. Canonical load unit, display/entered-unit behavior, and decimal precision.
2. Whether `CompletedSet` stores an `isWarmup` fact in the first slice and how
   working sets are classified later.
3. The exact completed-session correction/audit policy, including whether set
   deletion is represented as deletion or an auditable correction.
4. Exact provenance fields and referential actions for source routine and
   routine-exercise records.
5. Exact snapshot columns and whether any narrowly scoped versioned JSON
   supplement is needed.
6. Concurrency/idempotency behavior for multiple tabs, retries, and one active
   session per user.
7. Session timezone capture and local-date/week-boundary behavior.
8. Account export, deletion, and retention policy for long-lived performance
   history.

Do not add duration/distance modes, active-program coupling, analytics tables,
progression engines, recovery models, or correction abstractions while resolving
this first slice.

## Definition of done

An authenticated user can start, resume, record, complete/cancel, and retrieve
only their workouts; routine-based sessions preserve authoritative prescription
snapshots; exercise archival does not break history; lifecycle and numeric
invariants hold at the appropriate layers; the mobile workflow is usable; and
the ownership, transaction, migration, and immutability suites pass. The
existence of this document does not mark Phase 8 as implemented.
