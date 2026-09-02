# Workout sessions and performance recording

## Purpose and status

Phase 8 introduced the historical execution domain. The Prisma schema,
migrations, domain aggregate, application use cases, Prisma infrastructure,
HTTP presentation, and initial frontend workflow are implemented. This
document records the current session architecture and the adopted-program
integration boundary. The adopted-program persistence, domain, application,
Prisma infrastructure, and HTTP API are implemented. Frontend execution
behavior remains pending.

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

The implemented standalone execution hierarchy is:

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
- a freestyle workout;
- a particular `ProgramWorkoutOccurrence` from an adopted training program.

The long-term relationship remains:

```text
TrainingProgram
      ↓
AdoptedTrainingProgram
      ↓
ProgramWorkoutOccurrence
      ↓
WorkoutSession
```

`TrainingProgram` is a reusable template. `AdoptedTrainingProgram` and
`ProgramWorkoutOccurrence` copy its relative schedule when the program is
adopted. A program-origin session references one occurrence rather than only
the reusable template. A `WorkoutSession` remains independently valid when
started from a standalone routine or as freestyle training. Calendar dates and
weekday mapping are not part of the initial adopted-program slice.

Each cross-aggregate command must be persisted through exactly one atomic
application-port operation. Program-workout launch belongs to the source-aware
execution port in the `adopted-training-programs` application layer. The
workout-session command-side contract owns explicit completion and cancellation
operations that propagate linked occurrence/program transitions;
these must not be hidden inside its generic `update()` method. Calling separate
repositories sequentially, importing Prisma into application/domain code, or
using HTTP between local modules is not an acceptable substitute. This one-way
ownership avoids circular imports between `WorkoutSessionsModule` and
`AdoptedTrainingProgramsModule`. The exact atomic steps are specified in
[training programs](13-training-programs.md#atomic-application-port-operations).

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

Warm-up classification is included in the first schema as the boolean
`CompletedSet.isWarmup` fact. Warm-up sets remain valid historical observations,
but are excluded from working-set volume, PR detection, and muscle-set
estimates by default unless a metric explicitly requests them. Do not introduce
a larger set-status hierarchy merely to support this distinction.

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
separate command/query ports and Prisma adapters. `WorkoutSessionsModule`
follows that established architecture:

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

This is an implemented boundary, not authorization to add empty files or a CQRS
framework. The command side coordinates aggregate transitions and transactional
writes. The query side returns purpose-built read models and can grow specialized
history projections without forcing analytics concerns into the domain write
model. The implemented queries are:

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

## Implemented Phase 8 usable vertical slice

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
- list workout history, with optional case-insensitive partial search by the
  historical routine name snapshot;
- retrieve history for an exercise.

Starting from a routine creates the `WorkoutSession` and its initial ordered
`ExercisePerformance` prescription snapshots atomically.
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

Phase 9 begins only after Phase 8 and the Phase 8.5 adopted-program integration
provide stable, trustworthy history. Initial analytics remain completed
sessions, consistency, volume, estimated 1RM, PR detection, exercise frequency,
and basic muscle-set estimates. Materialized
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

Concurrency tests must cover stale aggregate writes, duplicate completion
attempts, and obvious duplicate-set creation. The first slice uses optimistic
version checks and the one-active-session database constraint; broader request
idempotency remains later work.

The Phase 8.5 integration additionally requires lifecycle tests for both adopted
aggregates; activation access and empty-schedule tests; schedule-copy and
snapshot-timing tests; start/skip, duplicate-start, activation, completion, and
cancellation race tests; atomic rollback tests; cancellation/retry history;
automatic parent completion; unavailable-source/explicit-skip behavior; owner
isolation; and program provenance in active-session and history UI. See the
complete matrix in [testing strategy](16-testing-strategy.md).

## Phase 8.5 integration sequence

1. **Complete:** Add the schema relations, reviewed partial indexes, and
   forward-only migrations with clean/current database verification. The
   persistence models are implemented in `schema.prisma` and must not be
   recreated.
2. Implement `AdoptedTrainingProgram` and `ProgramWorkoutOccurrence` lifecycle rules with
   focused domain tests first.
3. Add adopted-program application ports, use cases, read models, and narrow
   orchestration tests.
4. Implement activation, launch, skip, session completion, and session
   cancellation as atomic conditional Prisma operations with real PostgreSQL
   concurrency/rollback tests.
5. Add authenticated DTOs, canonical routes, Swagger contracts, safe error
   mapping, and API ownership/journey tests.
6. Build the responsive active-program page and integrate adoption/start actions
   into existing program and routine pages.
7. Add program context to active sessions and stable adopted-program provenance
   to workout history, including return-to-program progress behavior.
8. Run formatting checks, lint, type checks, unit/component, integration, API
   E2E, browser, Prisma, migration, and production-build verification before
   beginning Phase 9.

## Accepted session decisions and remaining deferrals

The following decisions are now approved for the Phase 8 MVP:

1. Canonical kilograms with Decimal(7,2), retaining the entered unit as KG/LB.
2. `CompletedSet.isWarmup` is stored from the first slice.
3. Completed and cancelled sessions are immutable in the MVP; a later
   correction/audit workflow will define how historical corrections are
   represented.
4. Nullable routine provenance with `SetNull`, stable Exercise UUID references,
   and explicit prescription snapshot columns.
5. Optimistic aggregate version checks and one active session per user; broader
   request idempotency remains later work.
6. Session timezone capture using IANA metadata plus UTC timestamps.

Account export, deletion, and retention for long-lived performance history
remain deferred product/privacy decisions; they are not approved by this
session-slice contract.

Do not add duration/distance modes, analytics tables, progression engines,
recovery models, or correction abstractions while adding the approved
adopted-program integration.

## Definition of done

Freestyle and standalone-routine sessions continue to start, resume, record,
complete/cancel, and render correctly. Program-origin sessions start only from
the next pending occurrence of an active adopted program. Occurrence/session
transitions are atomic; cancellation preserves the attempt and permits retry;
completion advances exactly once; explicit skip advances progress; the final
resolved occurrence makes the parent terminal `COMPLETED`; and program context
renders from stable snapshots. Ownership, concurrency, transaction, migration,
immutability, API, and frontend suites pass. Implementation status must continue
to be supported by repository code and verification results rather than this
document alone.
