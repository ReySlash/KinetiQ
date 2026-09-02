# Adopted Training Programs Failure Modes Catalog

This catalog records potential failure modes observed during a review of the
`adopted-training-programs` module. It does not assume that current behavior is
the intended specification. **Confirmed** identifies an approved expected
contract; **Pending decision** identifies behavior that still requires explicit
approval. All decisions currently recorded in this catalog are confirmed.

The most consequential findings are the missing linked session
completion/cancellation propagation, concealed-resource commands returning
`409` instead of `404`, and unstable HTTP error bodies.

## Boundary conditions

### BC-01 — Unbounded adoption slug

- **ID:** BC-01
- **Category:** Boundary conditions
- **Risk:** Low
- **Input that exposes it:** An otherwise valid lowercase slug containing thousands or millions of characters.
- **Current behavior observed in the code:** The DTO validates the slug's shape but has no maximum length. The template module generates slugs with a 120-character maximum.
- **Recommended expected contract:** Reject adoption slugs longer than the canonical 120-character training-program slug limit.
- **Contract status:** Confirmed
- **Why it matters:** Prevents unnecessarily expensive validation and database lookups and keeps transport rules aligned with source identifiers.

### BC-02 — Unbounded copied schedule and detail response

- **ID:** BC-02
- **Category:** Boundary conditions
- **Risk:** Medium
- **Input that exposes it:** A source program containing a very large number of schedule entries or an occurrence with a large retry history.
- **Current behavior observed in the code:** Adoption copies every schedule row in one nested write. Detail queries return every occurrence and every session-attempt ID without limits.
- **Recommended expected contract:** A training program may span no more than 52 weeks or 364 ordinal program days and may therefore contain no more than 364 valid schedule positions. A workout occurrence may retain no more than 20 attempts. Occurrence detail responses expose summary information only; complete attempt history is available through a cursor-paginated endpoint with a default limit of 20 and a maximum limit of 100.
- **Contract status:** Confirmed
- **Why it matters:** Large templates or accumulated retries could produce oversized transactions and authenticated API responses.

### BC-03 — Arbitrarily old or future workout start timestamps

- **ID:** BC-03
- **Category:** Boundary conditions
- **Risk:** Medium
- **Input that exposes it:** `startedAt` several years in the future or far before the adopted program began.
- **Current behavior observed in the code:** Any valid JavaScript date is accepted. It is not compared with the adopted program's `startedAt`, the current time, or a permissible backdating window.
- **Recommended expected contract:** Workout starts may be backdated by at most 30 days and must not precede the adopted program's `startedAt`. Future timestamps are accepted only within a five-minute clock-skew tolerance. All comparisons use the server's current UTC time, and violations are rejected without normalizing the submitted timestamp.
- **Contract status:** Confirmed
- **Why it matters:** Extreme timestamps can distort workout history, program chronology, and later analytics.

### BC-04 — No maximum duration or day number

- **ID:** BC-04
- **Category:** Boundary conditions
- **Risk:** Low
- **Input that exposes it:** `durationWeeks = 1_000_000` or `dayNumber = 100_000`.
- **Current behavior observed in the code:** Values must be positive integers, and occurrence weeks cannot exceed duration. No upper bounds exist.
- **Recommended expected contract:** Training-program duration must be between 1 and 52 weeks, producing an absolute maximum of 364 ordinal program days. Schedule position is represented by one 1-based `programDayNumber` in the range `1..durationWeeks * 7`; it is not a calendar weekday. Future implementation should derive week/day projections instead of maintaining independent representations of the same position. Violations return `422 Unprocessable Entity`.
- **Contract status:** Confirmed
- **Why it matters:** Very large values are valid today but may be unusable in UI, scheduling, or analytics.

### BC-05 — Progress percentage has unrestricted floating precision

- **ID:** BC-05
- **Category:** Boundary conditions
- **Risk:** Low
- **Input that exposes it:** One resolved occurrence out of three.
- **Current behavior observed in the code:** The API returns `33.33333333333333`.
- **Recommended expected contract:** Return `progressPercent` rounded to exactly two decimal places.
- **Contract status:** Confirmed
- **Why it matters:** Different clients may display or compare progress inconsistently.

## Equivalence classes

### EC-01 — Missing, unowned, and stale command targets are treated alike

- **ID:** EC-01
- **Category:** Equivalence classes
- **Risk:** Medium
- **Input that exposes it:** Pause, cancel, start, or skip using a nonexistent program ID, another owner's ID, or a valid ID in the wrong lifecycle state.
- **Current behavior observed in the code:** Conditional updates and lookups produce `AdoptedTrainingProgramConcurrencyError`, which maps all cases to HTTP `409`.
- **Recommended expected contract:** Missing, unowned, and child-outside-owned-parent cases should return concealed `404`; valid owned resources in stale or invalid states should return `409`.
- **Contract status:** Confirmed
- **Why it matters:** It preserves resource concealment while giving legitimate owners accurate conflict semantics.

### EC-02 — Slug normalization depends on entry point

- **ID:** EC-02
- **Category:** Equivalence classes
- **Risk:** Low
- **Input that exposes it:** `" strength-base "` or `"STRENGTH-BASE"` passed directly to the transport-neutral use case.
- **Current behavior observed in the code:** The HTTP DTO trims and rejects uppercase values, but the use case forwards its input unchanged. Non-HTTP callers may receive "not found" for semantically equivalent input.
- **Recommended expected contract:** Normalize slugs consistently at the application boundary, reusing domain value-object validation where practical.
- **Contract status:** Confirmed
- **Why it matters:** Transport-neutral use cases should not behave unexpectedly depending on which adapter invokes them.

### EC-03 — Any WorkoutSession uniqueness violation can become a concurrency conflict

- **ID:** EC-03
- **Category:** Equivalence classes
- **Risk:** Low
- **Input that exposes it:** A future or unrelated `WorkoutSession` unique constraint producing Prisma `P2002` with `modelName: "WorkoutSession"`.
- **Current behavior observed in the code:** Any such error is mapped to `AdoptedTrainingProgramConcurrencyError`, even before checking the constraint name.
- **Recommended expected contract:** Classify only the explicitly approved active-owner and active-occurrence unique-constraint violations as workout-session concurrency conflicts. Other uniqueness violations remain persistence failures unless an explicit domain mapping is approved. Regression coverage must prove both approved mappings and must prove that unrelated `WorkoutSession` constraints, missing `P2002` constraint metadata, uniqueness failures from other models, and non-`P2002` Prisma failures are not reclassified as concurrency conflicts.
- **Contract status:** Confirmed

- **Why it matters:** A future uniqueness constraint could be misreported as an ordinary race and conceal a persistence defect.

## Null or empty values

### NE-01 — Empty source schedule

- **ID:** NE-01
- **Category:** Null or empty values
- **Risk:** High if unhandled; currently mitigated
- **Input that exposes it:** Adopting an accessible template whose schedule is `[]`.
- **Current behavior observed in the code:** The use case throws `AdoptedTrainingProgramEmptyScheduleError`; the domain independently rejects an aggregate with no occurrences.
- **Recommended expected contract:** Continue rejecting activation with `422` and a stable error code.
- **Contract status:** Confirmed
- **Why it matters:** An active program with no occurrences cannot progress or complete meaningfully.

### NE-02 — Explicit null start timestamp

- **ID:** NE-02
- **Category:** Null or empty values
- **Risk:** Low
- **Input that exposes it:** `{ "timezone": "Asia/Qatar", "startedAt": null }`.
- **Current behavior observed in the code:** `@IsOptional()` accepts `null`; the workout-session domain treats it like an omitted value and uses the current time.
- **Recommended expected contract:** `startedAt` is optional but not nullable. When omitted, the server uses its current time. When present, it must be a valid datetime; explicit `null` returns `400 Bad Request`.
- **Contract status:** Confirmed
- **Why it matters:** Silent null-to-now conversion may hide client serialization defects.

### NE-03 — Blank optional provenance IDs become null

- **ID:** NE-03
- **Category:** Null or empty values
- **Risk:** Low
- **Input that exposes it:** `sourceRoutineId: ""` or `sourceTrainingProgramRoutineId: "   "`.
- **Current behavior observed in the code:** An empty string becomes `null`; whitespace-only text reaches UUID validation and fails.
- **Recommended expected contract:** `sourceRoutineId` and `sourceTrainingProgramRoutineId` are optional but not nullable-to-blank identifiers. When present, each must be a valid UUID; empty and whitespace-only strings are invalid and return `400 Bad Request` at an applicable transport boundary.
- **Contract status:** Confirmed
- **Why it matters:** Equivalent blank values currently produce different outcomes.

### NE-04 — Routine with no exercises is considered startable

- **ID:** NE-04
- **Category:** Null or empty values
- **Risk:** Medium
- **Input that exposes it:** A visible source routine with `exercises: []`.
- **Current behavior observed in the code:** It has no inactive exercises, so `sourceRoutineAvailable` is true and starting creates an in-progress workout session with zero exercise performances.
- **Recommended expected contract:** A program workout occurrence is startable only when its source routine contains at least one currently executable exercise. A routine with zero executable exercises is unavailable; a start attempt creates no workout session and leaves the occurrence `PENDING`.
- **Contract status:** Confirmed
- **Why it matters:** An empty session may be impossible to complete meaningfully and can block program progress.

### NE-05 — Persisted program with no occurrences bypasses the domain

- **ID:** NE-05
- **Category:** Null or empty values
- **Risk:** Medium
- **Input that exposes it:** A database row for an active adopted program with zero child occurrences, introduced through migration, manual SQL, or corrupted data.
- **Current behavior observed in the code:** Detail queries map Prisma rows directly without reconstituting the aggregate. They return `totalCount: 0`, `progressPercent: 0`, no next occurrence, and no automatic completion.
- **Recommended expected contract:** A persisted adopted program with no occurrences is invalid state. Reads and commands must report a controlled internal consistency failure rather than expose or operate on it as a valid program.
- **Contract status:** Confirmed
- **Why it matters:** A corrupt active program can permanently consume the owner's one non-terminal-program slot.

## Business contract violations

### BV-01 — Program-origin session completion and cancellation propagation

- **ID:** BV-01
- **Category:** Business contract violations
- **Risk:** High
- **Input that exposes it:** Start a program occurrence, then complete or cancel the resulting workout through the current workout-session commands.
- **Current behavior observed in the code:** Explicit workout-session completion and cancellation command-port operations resolve `programWorkoutOccurrenceId` and persist the session, occurrence, and parent transitions in one Serializable Prisma transaction. Standalone sessions remain session-only.
- **Recommended expected contract:** Completion and cancellation must atomically propagate the approved occurrence and parent transitions while preserving session history.
- **Contract status:** Confirmed
- **Implementation status:** Implemented and covered by unit and PostgreSQL E2E tests.
- **Why it matters:** A started program workout can leave the occurrence permanently `IN_PROGRESS`, preventing pause, cancellation, retry, and further progression.

### BV-02 — Reconstitution accepts parent/child lifecycle contradictions

- **ID:** BV-02
- **Category:** Business contract violations
- **Risk:** Medium
- **Input that exposes it:** A `COMPLETED` parent containing a `PENDING` occurrence, a `CANCELLED` parent containing an `IN_PROGRESS` occurrence, or an `ACTIVE` parent whose occurrences are all resolved.
- **Current behavior observed in the code:** Aggregate validation checks timestamp shape and occurrence structure but not coherence between parent status and occurrence statuses.
- **Recommended expected contract:** Define and enforce the valid parent/child status matrix during reconstitution.
- **Contract status:** Confirmed
- **Why it matters:** Contradictory state can produce incorrect actions, progress, and terminal-history behavior.

### BV-03 — Domain occurrence resolution does not automatically complete the parent

- **ID:** BV-03
- **Category:** Business contract violations
- **Risk:** Medium
- **Input that exposes it:** Call `skipOccurrence()` or `completeOccurrence()` on the final unresolved occurrence.
- **Current behavior observed in the code:** The returned aggregate retains its existing parent status until `complete()` is called separately. The Prisma skip operation independently implements automatic completion.
- **Recommended expected contract:** Resolving the final unresolved occurrence automatically transitions the parent program to `COMPLETED` in the same operation. Domain and persistence behavior must produce the same transition.
- **Contract status:** Confirmed
- **Why it matters:** Different adapters or future callers can produce different aggregate outcomes for the same business event.

### BV-04 — `canStartNext` ignores another active owner session

- **ID:** BV-04
- **Category:** Business contract violations
- **Risk:** Medium
- **Input that exposes it:** An active adopted program with a startable pending occurrence while the owner has an unrelated in-progress workout.
- **Current behavior observed in the code:** The read model returns `canStartNext: true`. Starting then fails at the database's one-active-session constraint with `409`.
- **Recommended expected contract:** Because action flags represent complete server policy, `canStartNext` must be `false` whenever the owner has another active workout session.
- **Contract status:** Confirmed
- **Why it matters:** The UI can advertise an action the server already knows cannot succeed.

### BV-05 — Stable error codes are discarded at the HTTP boundary

- **ID:** BV-05
- **Category:** Business contract violations
- **Risk:** Medium
- **Input that exposes it:** Empty schedule, unavailable source, concurrent adoption, or stale start.
- **Current behavior observed in the code:** Application errors contain stable `code` fields, but the exception mapper constructs Nest exceptions from only `error.message`.
- **Recommended expected contract:** Return the approved stable code in the structured HTTP error body while keeping sensitive persistence details concealed.
- **Contract status:** Confirmed
- **Why it matters:** Frontend behavior otherwise depends on English message text or HTTP status alone.

### BV-06 — Pause and cancellation trust occurrence status rather than linked session state

- **ID:** BV-06
- **Category:** Business contract violations
- **Risk:** Low under normal atomic writes; Medium under inconsistent state
- **Input that exposes it:** An occurrence marked `PENDING` with a linked `IN_PROGRESS` session, or an occurrence marked `IN_PROGRESS` whose session is already terminal.
- **Current behavior observed in the code:** Pause and cancellation check only whether any occurrence has status `IN_PROGRESS`.
- **Recommended expected contract:** Pause and cancellation are rejected when either an occurrence is `IN_PROGRESS` or a linked workout session is active. A mismatch between occurrence and session state is an internal consistency failure rather than a reason to permit the lifecycle change.
- **Contract status:** Confirmed
- **Why it matters:** Any partial or migrated inconsistency may allow an unsafe lifecycle change or permanently block a safe one.

### BV-07 — Source authorization and copying are not one transaction

- **ID:** BV-07
- **Category:** Business contract violations
- **Risk:** Low to Medium
- **Input that exposes it:** The source template is edited, changes visibility, or is deleted after `findAccessibleBySlug()` but before `create()`.
- **Current behavior observed in the code:** Source resolution and adopted-program creation are separate Prisma operations. Nested creation itself is atomic, but source authorization and snapshot selection are outside that transaction.
- **Recommended expected contract:** Adoption uses a source template that is accessible to the user and snapshot-consistent at the time of adoption. Source validation, authorization, snapshot reads, and adopted-program creation occur in the same transaction.
- **Contract status:** Confirmed
- **Why it matters:** A narrow race can produce a generic persistence failure or adopt a snapshot based on access that changed during the request.

### BV-08 — Source availability omits prescription validity

- **ID:** BV-08
- **Category:** Business contract violations
- **Risk:** Low
- **Input that exposes it:** A visible routine whose persisted exercise prescription is malformed but whose exercises are active.
- **Current behavior observed in the code:** The read model reports the source as available. Starting later delegates to `WorkoutSession.start()`, which may raise a workout-session validation error and become a generic `500`.
- **Recommended expected contract:** Missing, inaccessible, inactive, or empty source routines are normal business unavailability and make the start action unavailable with an appropriate domain reason. A source routine whose persisted prescription violates required invariants is corrupted state: the read model must report it as non-startable, the command must create no session, and the attempt must raise a specific internal application error mapped to `500`. Read-model and command validation must share the same executable-prescription invariants, and integrity failures must be logged with sufficient operational context without exposing sensitive data.
- **Contract status:** Confirmed
- **Why it matters:** The current read model can promise startability without validating everything required to create the session.
