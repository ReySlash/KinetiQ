# Routine builder

## Purpose and user problem

A routine is a reusable, owned workout template. Users need to arrange catalog exercises and attach prescription targets without changing global exercise definitions or confusing a plan with performed history.

## MVP scope

Private user-owned routines support create, list, detail, edit, duplicate, and delete. Each has ordered `RoutineExercise` children with sets, rep range, target RIR, rest, tempo, and notes. The UI supports add, remove, reorder, and validation. Visibility is stored but MVP only permits `PRIVATE` behavior; public sharing is deferred.

## Out of scope

Weekly scheduling, completed workouts, target RPE, supersets/circuits, progression rules, conditional prescriptions, per-set prescriptions, collaboration, public templates, custom exercises, analytics, and estimated duration.

## User stories

- An authenticated user can create an ordered routine from active global exercises.
- A user can edit, duplicate, and delete only their routines.
- A duplicated routine gets independent child rows and a clear copy name.
- A routine may contain the same exercise more than once when it represents distinct blocks or prescriptions.
- Changes never alter global exercises and, later, never alter historical sessions.

## Suggested models

```prisma
model Routine {
  id          String            @id @db.Uuid
  ownerId     String            @db.Uuid
  name        String
  description String?
  visibility  RoutineVisibility @default(PRIVATE)
  createdAt   DateTime          @default(now()) @db.Timestamptz(3)
  updatedAt   DateTime          @updatedAt @db.Timestamptz(3)
  owner       User              @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  exercises   RoutineExercise[]

  @@index([ownerId, updatedAt])
  @@index([ownerId, name])
}

model RoutineExercise {
  id          String   @id @db.Uuid
  routineId   String   @db.Uuid
  exerciseId  String   @db.Uuid
  order       Int
  sets        Int
  minReps     Int
  maxReps     Int
  targetRir   Int?
  restSeconds Int?
  tempo       String?
  notes       String?
  createdAt   DateTime @default(now()) @db.Timestamptz(3)
  updatedAt   DateTime @updatedAt @db.Timestamptz(3)
  routine     Routine  @relation(fields: [routineId], references: [id], onDelete: Cascade)
  exercise    Exercise @relation(fields: [exerciseId], references: [id], onDelete: Restrict)

  @@unique([routineId, order])
  @@index([routineId])
  @@index([exerciseId])
}
```

Use a surrogate ID so the same exercise may appear twice. Store dense zero-based `order` integers and rewrite them transactionally after reorder. This is simpler than fractional ranks for expected routine sizes. If reorder concurrency becomes real, add a routine `version` and optimistic concurrency.

## Domain rules and validation

- Name: 2–120 trimmed characters; description at most 2,000.
- MVP routine has 1–50 exercises to prevent accidental/abusive payloads. A draft with zero exercises may be allowed only if explicitly supported; recommendation: permit zero while editing/saving a new routine, show “incomplete,” and require one before it can later be scheduled.
- `order` values submitted by clients need not be trusted. Validate unique positions, normalize to contiguous order in the service, and return canonical order.
- Sets: integer 1–20. Reps: integers 1–1,000 and `minReps <= maxReps`. Very high limits allow endurance/bodyweight use but signal that duration mode is later.
- Target RIR: optional integer 0–10. Rest: optional integer 0–3,600 seconds.
- Tempo: optional normalized notation up to 30 characters. MVP accepts a documented `eccentric-pause-concentric-pause` pattern such as `3-1-X-0`; validate each token as `0..9` or `X`.
- Notes: at most 1,000 characters and rendered as escaped plain text.
- Only active exercises can be newly added. Existing references to later-archived exercises remain visible with a warning and can be removed/replaced.
- Owner ID always comes from the authenticated principal, never the request body.

## API endpoints

- `POST /api/v1/routines`
- `GET /api/v1/routines?q=&sort=updatedAt:desc&page=&pageSize=`
- `GET /api/v1/routines/:id`
- `PATCH /api/v1/routines/:id`
- `DELETE /api/v1/routines/:id`
- `POST /api/v1/routines/:id/duplicate`

Create/update receive the routine and complete ordered child array; write in one transaction. For MVP, delete may be hard delete because no sessions/plans exist. Before those phases ship, change to restrictive/archive semantics where referenced. Duplication copies scalar values and children, uses a name like `<name> (Copy)` with collision-safe truncation, and returns `201` with the new resource.

## Ownership and authorization

Every service query includes ownership:

```text
findFirst({ where: { id: routineId, ownerId: principal.userId } })
updateMany({ where: { id: routineId, ownerId: principal.userId }, data })
```

For complex child replacements, first resolve the owned parent within the transaction; child deletes/updates also constrain `routineId`. Return `404` for another user’s private resource to avoid confirming it exists. Do not fetch globally then rely only on a later in-memory owner comparison.

## Frontend pages and components

- `/app/routines`: owned cards/list, search, empty state, duplicate/delete menus
- `/app/routines/new`: builder
- `/app/routines/[id]`: detail with prescription summary
- `/app/routines/[id]/edit`: builder
- `RoutineForm`, `ExercisePicker`, `RoutineExerciseCard`, `PrescriptionFields`, `ReorderHandle`, `RoutineSummary`, confirmation dialog

Use accessible drag-and-drop only if it includes keyboard controls and move-up/down alternatives. A simple button-based reorder is an acceptable first implementation. Mutations invalidate/update only the authenticated routine keys; optimistic reorder must roll back and announce errors.

## Testing requirements

- Unit/DTO: ranges, rep ordering, tempo tokens, list size, normalized ordering
- Service: transactional child replacement, duplicate creates independent IDs, name truncation, archived exercise rule
- Prisma: `(routineId, order)` uniqueness, cascade children, restricted exercise delete, owner indexes
- Authorization: anonymous 401; user B cannot list/read/update/delete/duplicate user A’s routines; indistinguishable 404
- API E2E: full lifecycle, rollback on invalid child, canonical order, pagination
- Frontend: field arrays, duplicate exercises allowed, error focus, reorder keyboard path, loading/empty/error, optimistic rollback
- Playwright: two isolated users prove ownership; create/duplicate/edit/delete flow

## Edge cases

Duplicate exercises, concurrent edit/reorder, account deletion, archived catalog exercise, empty routine, stale exercise selector data, deletion after future schedule/session references, and partial network failure. Return current `updatedAt`; introduce a version conflict response when real concurrent editing appears.

## Dependencies and implementation sequence

Requires auth, users, and active exercise reads. Implement schema/constraints, ownership repository/service, endpoints, routine list/detail, builder, duplication, then comprehensive cross-user and E2E tests.

## Definition of done

An authenticated user completes every lifecycle action on only their records; prescriptions validate and persist atomically in canonical order; duplication is independent; archived exercises are handled; responsive/keyboard workflows pass; and negative ownership tests exist at service and API levels.

## Future extensions and open questions

Add estimated duration, RPE, per-set targets, supersets/circuits, progression rules, tags, public sharing, imports, and versions later. Before training plans, decide delete/archive behavior. Before sessions, define snapshot rules. MVP’s accepted choices are private-only visibility, dense integer ordering, and duplicate exercise occurrences allowed.

