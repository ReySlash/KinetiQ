# Training programs and relative scheduling

## Purpose and implementation boundary

A `TrainingProgram` is a reusable multi-week template that schedules existing
routine templates. This persistence slice adds only the template and its
schedule rows. Controllers, services, DTOs, API endpoints, frontend screens,
seeds, activation, calendar placement, and performed-training models remain out
of scope.

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
- **Future ActiveProgram / UserTrainingProgram:** a user's adopted instance of a
  program. This layer will own activation state, start date, calendar mapping,
  and any user-specific execution concerns.
- **Future WorkoutSession and ExercisePerformance:** historical planned and
  performed training. These models will preserve what the athlete actually did
  rather than treating mutable templates as history.

The future execution hierarchy is intentionally separate:

```text
TrainingProgram
    ↓
ActiveProgram / UserTrainingProgram
    ↓
WorkoutSession
    ↓
ExercisePerformance
```

None of the future execution models are part of this persistence slice.

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
days. Actual dates and weekday mapping belong to the future active-program or
workout-session layer.

`TrainingProgram.durationWeeks` stores the declared duration explicitly. Do not
derive program duration only from `MAX(weekNumber)`: a program may intentionally
contain an unscheduled week, and its declared contract should not change merely
because a schedule row changes.

The database prevents two routines from occupying the same slot with unique
`(trainingProgramId, weekNumber, dayNumber)`. The future service layer must also
validate integer values with these rules:

```text
weekNumber >= 1
weekNumber <= durationWeeks
dayNumber >= 1
durationWeeks >= 1
```

The existing schema has no general convention for positive-integer SQL checks,
so this slice does not introduce one-off raw check constraints. These rules must
be enforced by DTO/service validation when the API is implemented. A later
repository-wide database constraint policy may add matching checks through a
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

Future authorization must derive `ownerId` from the authenticated principal and
must verify that each attached routine is visible/eligible for the program in
the same transaction. The exact service and API contract requires a later
approved design.

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

## MVP persistence model

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
concrete future workflow requires metadata or behavior at those levels. Also
deferred are active/user programs, workout sessions, exercise performance,
weekday enums, direct program exercises, progression rules, percentage-based
loading, mesocycles, `daysPerWeek`, and frontend-specific fields.

## Persistence verification for this slice

Format and validate the Prisma schema, generate and inspect a forward-only
migration, and run the existing backend suite. Do not seed training programs or
add placeholder API tests. Future implementation will need focused database and
service tests for slot uniqueness, bounds validation, ownership, eligible
routine attachment, deletion restriction, program cascade behavior, and deep
copying of global templates.
