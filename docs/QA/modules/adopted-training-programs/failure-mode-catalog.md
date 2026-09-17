# Adopted Training Programs Failure Modes Catalog

This catalog records potential failure modes observed during a review of the
`adopted-training-programs` module. It does not assume that current behavior is
the intended specification. **Confirmed** identifies an approved expected
contract; **Pending decision** identifies behavior that still requires explicit
approval. All decisions currently recorded in this catalog are confirmed.

The most consequential confirmed contracts concern linked session
completion/cancellation propagation, concealed-resource classification, stable
HTTP error bodies, and consistency between adopted-program occurrences and
linked workout sessions. These behaviors are implemented and covered by the
current unit, API, and PostgreSQL E2E suites.

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
- **Current behavior observed in the code:** Aggregate reconstitution validates timestamp chronology, occurrence structure, and parent/child lifecycle coherence.
- **Recommended expected contract:** Define and enforce the valid parent/child status matrix during reconstitution.
- **Contract status:** Confirmed
- **Why it matters:** Contradictory state can produce incorrect actions, progress, and terminal-history behavior.

### BV-03 — Domain occurrence resolution does not automatically complete the parent

- **ID:** BV-03
- **Category:** Business contract violations
- **Risk:** Medium
- **Input that exposes it:** Call `skipOccurrence()` or `completeOccurrence()` on the final unresolved occurrence.
- **Current behavior observed in the code:** Domain occurrence resolution and the Prisma occurrence commands automatically complete the parent when every occurrence is resolved.
- **Recommended expected contract:** Resolving the final unresolved occurrence automatically transitions the parent program to `COMPLETED` in the same operation. Domain and persistence behavior must produce the same transition.
- **Contract status:** Confirmed
- **Why it matters:** Different adapters or future callers can produce different aggregate outcomes for the same business event.

### BV-04 — `canStartNext` ignores another active owner session

- **ID:** BV-04
- **Category:** Business contract violations
- **Risk:** Medium
- **Input that exposes it:** An active adopted program with a startable pending occurrence while the owner has an unrelated in-progress workout.
- **Current behavior observed in the code:** The read model includes the owner's active-session state and returns `canStartNext: false` when starting would violate the active-session invariant.
- **Recommended expected contract:** Because action flags represent complete server policy, `canStartNext` must be `false` whenever the owner has another active workout session.
- **Contract status:** Confirmed
- **Why it matters:** The UI can advertise an action the server already knows cannot succeed.

### BV-05 — Stable error codes are discarded at the HTTP boundary

- **ID:** BV-05
- **Category:** Business contract violations
- **Risk:** Medium
- **Input that exposes it:** Empty schedule, unavailable source, concurrent adoption, or stale start.
- **Current behavior observed in the code:** The HTTP exception mapper preserves stable application error codes while concealing persistence details.
- **Recommended expected contract:** Return the approved stable code in the structured HTTP error body while keeping sensitive persistence details concealed.
- **Contract status:** Confirmed
- **Why it matters:** Frontend behavior otherwise depends on English message text or HTTP status alone.

### BV-06 — Pause and cancellation trust occurrence status rather than linked session state

- **ID:** BV-06
- **Category:** Business contract violations
- **Risk:** Low under normal atomic writes; Medium under inconsistent state
- **Input that exposes it:** An occurrence marked `PENDING` with a linked `IN_PROGRESS` session, or an occurrence marked `IN_PROGRESS` whose session is already terminal.
- **Current behavior observed in the code:** Pause and cancellation validate both occurrence and linked-session states transactionally, classifying mismatches as persistence-state errors.
- **Recommended expected contract:** Pause and cancellation are rejected when either an occurrence is `IN_PROGRESS` or a linked workout session is active. A mismatch between occurrence and session state is an internal consistency failure rather than a reason to permit the lifecycle change.
- **Contract status:** Confirmed
- **Why it matters:** Any partial or migrated inconsistency may allow an unsafe lifecycle change or permanently block a safe one.

### BV-07 — Source authorization and copying are not one transaction

- **ID:** BV-07
- **Category:** Business contract violations
- **Risk:** Low to Medium
- **Input that exposes it:** The source template is edited, changes visibility, or is deleted after `findAccessibleBySlug()` but before `create()`.
- **Current behavior observed in the code:** Source authorization, snapshot resolution, aggregate construction, and adopted-program creation run in one Serializable Prisma transaction.
- **Recommended expected contract:** Adoption uses a source template that is accessible to the user and snapshot-consistent at the time of adoption. Source validation, authorization, snapshot reads, and adopted-program creation occur in the same transaction.
- **Contract status:** Confirmed
- **Why it matters:** A narrow race can produce a generic persistence failure or adopt a snapshot based on access that changed during the request.

### BV-08 — Source availability omits prescription validity

- **ID:** BV-08
- **Category:** Business contract violations
- **Risk:** Low
- **Input that exposes it:** A visible routine whose persisted exercise prescription is malformed but whose exercises are active.
- **Current behavior observed in the code:** Read and start paths share executable-prescription validation; malformed persisted prescriptions are unavailable to start and map to a controlled internal integrity error.
- **Recommended expected contract:** Missing, inaccessible, inactive, or empty source routines are normal business unavailability and make the start action unavailable with an appropriate domain reason. A source routine whose persisted prescription violates required invariants is corrupted state: the read model must report it as non-startable, the command must create no session, and the attempt must raise a specific internal application error mapped to `500`. Read-model and command validation must share the same executable-prescription invariants, and integrity failures must be logged with sufficient operational context without exposing sensitive data.
- **Contract status:** Confirmed
- **Why it matters:** The current read model can promise startability without validating everything required to create the session.

## Additional findings from the global-program copy review

### Boundary conditions

### BC-06 — Deep-copy fan-out has no explicit upper bound

- **ID:** BC-06
- **Category:** Boundary conditions
- **Risk:** Medium
- **Input that exposes it:** A global program containing many distinct scheduled routines, each with many exercises and prescriptions.
- **Current behavior observed in the code:** Adoption loads the complete source graph and creates every distinct routine, every routine exercise, the copied program schedule, and the adopted occurrences inside one interactive Serializable transaction. The new copy path adds work proportional to the number of distinct routines and exercises, but does not impose a copy-specific size limit or transaction budget.
- **Recommended expected contract:** Use the existing program, routine, and exercise validation limits for synchronous global-program copying. Do not add a separate copy-specific aggregate cap.
- **Contract status:** Confirmed
- **Why it matters:** A large but technically valid global template can cause long transactions, lock contention, request timeouts, or expensive rollback work.

### BC-07 — Copy-time text validation is not classified as source validation

- **ID:** BC-07
- **Category:** Boundary conditions
- **Risk:** Low to Medium
- **Input that exposes it:** A persisted global routine with a description longer than the routine domain limit, or a persisted global program with a description longer than the training-program domain limit.
- **Current behavior observed in the code:** Prescription validity is checked explicitly before writes, but copied descriptions and names are validated only when `Routine.create()` or `TrainingProgram.create()` runs. The resulting domain exception is caught by the adoption boundary and becomes a generic persistence failure; the transaction does roll back.
- **Recommended expected contract:** Validate all copied source fields before writing and classify invalid persisted source content as source-integrity failure, consistently with malformed prescriptions. Do not report source defects as infrastructure persistence failures.
- **Contract status:** Confirmed
- **Why it matters:** Operators and clients cannot distinguish an unusable global template from a database outage, even though the source—not persistence—is the cause.

### Equivalence classes

### EC-04 — Inaccessible routine handling differs between global and private adoption

- **ID:** EC-04
- **Category:** Equivalence classes
- **Risk:** Medium
- **Input that exposes it:** A private program owned by the adopter whose schedule references another user's private routine, compared with a global program whose schedule references an inaccessible private routine.
- **Current behavior observed in the code:** Global adoption validates every scheduled routine and rejects an inaccessible routine before creating copies. Private adoption remains on the existing direct-adoption path; `toSource()` converts an inaccessible routine to `routineId: null`, and adoption can proceed with an occurrence that has no source routine.
- **Recommended expected contract:** Every adopted program, including an existing private program, must have an accessible routine for every schedule entry. Reject inaccessible or missing scheduled routines before adoption for both global and private programs.
- **Contract status:** Confirmed
- **Why it matters:** The same invalid source graph can produce a controlled rejection for a global program but a partially unusable adopted program for a private one.

### EC-05 — Corrupted schedule positions fail after copy construction begins

- **ID:** EC-05
- **Category:** Equivalence classes
- **Risk:** Low
- **Input that exposes it:** A global program row containing duplicate schedule positions, an invalid day number, or a week number outside the program duration, introduced by legacy data or direct database changes.
- **Current behavior observed in the code:** The source mapper reads the rows, then the copy path creates copied routines before `TrainingProgram.create()` validates the copied schedule. The serializable transaction rolls those writes back, and the outer mapper reports a generic persistence failure.
- **Recommended expected contract:** Treat invalid schedule structure as source-integrity failure and validate it before creating routine copies. Return the controlled source-integrity error while guaranteeing that no personal records remain.
- **Contract status:** Confirmed
- **Why it matters:** The atomic rollback prevents partial data, but the late and generic classification makes repair and user-facing handling less precise.

### Null or empty values

### NE-06 — Non-empty schedule with a null routine relation is not explicitly guarded

- **ID:** NE-06
- **Category:** Null or empty values
- **Risk:** Low
- **Input that exposes it:** A schedule row whose required routine relation is missing because of corrupted data, an incomplete migration, or a database fixture that bypasses foreign-key guarantees.
- **Current behavior observed in the code:** The Prisma source type assumes `entry.routine` is present. The mapper dereferences it while building the source model, so a null relation would raise an unclassified runtime error rather than the module's source-unavailable or source-integrity error.
- **Recommended expected contract:** A scheduled entry without a routine is invalid source state. Detect it during source validation, abort the transaction before writes, and map it to the controlled source-integrity response.
- **Contract status:** Confirmed
- **Why it matters:** Defensive handling avoids turning malformed persistence state into an opaque 500 or an uncaught exception path.

### NE-07 — Empty global routines are rejected, but the rejection reason is shared with access failures

- **ID:** NE-07
- **Category:** Null or empty values
- **Risk:** Low
- **Input that exposes it:** A global program schedules a visible routine whose exercise list is empty.
- **Current behavior observed in the code:** `isRoutineStartableForOwner()` returns false for an empty exercise list, and adoption raises `AdoptedTrainingProgramSourceUnavailableError`, the same application error used for inaccessible or otherwise unavailable routines.
- **Recommended expected contract:** Continue rejecting the adoption atomically with the existing unavailable-source contract. Distinguish empty source content from visibility or ownership failure only in safe server-side diagnostics.
- **Contract status:** Confirmed
- **Why it matters:** Both cases currently produce the same client-facing classification, which can make a publicly visible but malformed global template difficult to diagnose.

### Business contract violations

### BV-09 — Copy source identifiers must remain aligned with copied schedule rows

- **ID:** BV-09
- **Category:** Business contract violations
- **Risk:** Medium
- **Input that exposes it:** A global program with multiple schedule entries, repeated routine references, and entries ordered differently from the in-memory construction order.
- **Current behavior observed in the code:** The copied program is sorted by week/day by the domain entity. The returned adopted source is then reconstructed by pairing copied schedule entries with the source rows by array index, while occurrences use those returned copied entry IDs and routine IDs.
- **Recommended expected contract:** Each adopted occurrence's `sourceTrainingProgramRoutineId` must identify the exact copied schedule row for its week/day, and `sourceRoutineId` must identify the copied routine used by that row. Match copied schedule entries by the unique `weekNumber` and `dayNumber` position rather than relying on positional correspondence.
- **Contract status:** Confirmed
- **Why it matters:** If source ordering and domain ordering ever diverge, occurrences could point to the wrong copied schedule entry or routine even though all records were created successfully.

### BV-10 — Private adoption can preserve a null routine source after the new global-copy validation

- **ID:** BV-10
- **Category:** Business contract violations
- **Risk:** Medium
- **Input that exposes it:** Adoption of an owned private program containing a schedule entry whose routine is inaccessible or missing.
- **Current behavior observed in the code:** The private path does not copy or revalidate the complete source. It may create an adopted occurrence with `sourceRoutineId: null`; later start behavior must then handle the missing source routine as unavailable.
- **Recommended expected contract:** Private adoption rejects missing or inaccessible scheduled routines before creating the adopted program. Adoption must not create a program that contains an occurrence with a null routine source.
- **Contract status:** Confirmed
- **Why it matters:** A successful adoption can create a program that cannot execute its next scheduled workout, leaving the user with no clear recovery path.

### BV-11 — Source-copy validation and application-level error semantics are not fully aligned

- **ID:** BV-11
- **Category:** Business contract violations
- **Risk:** Low to Medium
- **Input that exposes it:** A global source that passes prescription checks but fails a domain invariant while constructing a copied routine or program, such as an invalid source name, description, or schedule.
- **Current behavior observed in the code:** Validation, copy construction, and adoption are atomic, but only the explicitly checked prescription/access failures have dedicated source errors. Domain failures raised during copy construction are translated to adopted-program persistence failure.
- **Recommended expected contract:** Invalid source-content failures use the documented source-integrity classification, while actual database failures retain persistence classification. The transaction remains rollback-safe in both cases.
- **Contract status:** Confirmed
- **Why it matters:** Stable error semantics are needed for safe frontend messaging and for operators to identify defective global templates instead of infrastructure failures.
