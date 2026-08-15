# Training programs and relative scheduling

## Purpose and current implementation boundary

A `TrainingProgram` is a reusable multi-week template that schedules existing
routine templates. The persistence model and migration are complete. The
backend-only Clean Architecture/DDD vertical-slice pilot currently implements
the approved `GET /api/training-programs` list, slug-based detail read, authenticated
`POST /api/training-programs` create, and owner-scoped `PATCH` update. Create and
update persist the complete aggregate,
including its optional schedule, in one transaction. List supports the approved
visibility scopes, search, sorting, limit, and offset through a bounded read
projection. Delete, Swagger expansion, and the other proposed backend operations
remain unimplemented and require approval before coding.
Frontend screens, seeds, activation, calendar placement,
performed-training models, and duplication remain out of scope.

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

## Backend architecture pilot

Training Programs is an isolated pilot of the architecture defined in
[Architecture](02-architecture.md). It remains one NestJS feature module in the
modular monolith; the vertical slice is organizational and dependency-oriented,
not a microservice boundary.

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
      training-program.models.ts
  infrastructure/
    persistence/prisma/
      prisma-training-programs.repository.ts
      prisma-training-program.mapper.ts
  presentation/
    http/
      dto/
      training-programs.controller.ts
      training-programs-exception.mapper.ts
  training-programs.module.ts
```

This is a target organization, not a requirement to create empty placeholder
files. Add a file only when the implementation gives it a concrete
responsibility.

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
  imports the existing `PrismaModule`; the pilot does not relocate shared auth
  or database infrastructure.

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
  → TrainingProgramsQueryRepository (application read port)
  → PrismaTrainingProgramsRepository
  → Prisma mapper
  → lightweight list projection
```

The create path uses the application `TrainingProgramsCommandRepository` command port. It
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

## Implemented backend slice and future operations

The implemented operations are:

```text
GET /api/training-programs
GET /api/training-programs/:slug
POST /api/training-programs
```

GET accepts the approved `scope`, `q`, `sort`, `limit`, and `offset` parameters.
POST accepts `name`, `description`, `durationWeeks`, optional `slug`, and an
optional `schedule` that defaults to an empty array. Identity, owner,
visibility, and timestamps are server-controlled. Whether supplied or omitted,
the slug base is normalized and gets an eight-character UUID suffix.

The remaining delete contract below is a proposal and still requires explicit
approval before implementation.

### Use cases

1. `CreateTrainingProgram`: create one private owned template and its complete
   schedule atomically.
2. `ListTrainingPrograms`: list either the caller's private templates or global
   templates with search, sorting, limit, and offset.
3. `GetTrainingProgram`: return an accessible private/global template and its
   ordered schedule with routine summaries. This read path is implemented;
   delete remains deferred.
4. `UpdateTrainingProgram`: update an owned PRIVATE template. Name,
   description, and duration are optional patch fields; omitted values are
   preserved. A supplied schedule replaces the complete schedule, including
   an empty array to clear it. The slug is immutable and the parent plus child
   rows are persisted atomically.
5. `DeleteTrainingProgram`: delete an owned private template; database cascade
   removes only its schedule rows.

Global program creation/editing, duplication, activation, archive state,
calendar placement, and session launch are excluded.

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

## Implementation sequence after contract approval

1. Create only the folders/files needed for domain invariants and repository
   contracts; add domain tests first.
2. Add application use cases and behavior-focused tests using repository fakes.
3. Implement the Prisma mapper/repository and real PostgreSQL integration tests.
4. Add presentation DTOs, controller, Swagger documentation, and error mapping.
5. Wire the feature module into `AppModule`.
6. Add API E2E ownership and lifecycle coverage.
7. Add the Routine delete-conflict translation and its regression test.
8. Run Prisma validation, lint, typecheck, unit/integration/E2E tests, and build.

## Persistence verification completed

Format and validate the Prisma schema, generate and inspect a forward-only
migration, and run the existing backend suite. The persistence slice completed
those checks. Do not seed Training Programs as part of the backend slice.

## Remaining decisions requiring explicit approval before coding

1. Define delete behavior and include the Routine delete-conflict translation
   when delete-related work is approved.
2. Define any global-program management path; normal users currently create
   PRIVATE programs only.
