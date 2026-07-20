# Workout sessions and performance recording

## Purpose and status

Workout sessions capture what an athlete actually performed. They are post-MVP and must be distinct from routines so editing a template never rewrites history.

## First session slice

Support strength/repetition workouts launched from a routine or created ad hoc. Use `WorkoutSession`, ordered `SessionExercise`, and ordered `CompletedSet`. Capture snapshots of identity and prescription at launch, then record load, reps, RIR/RPE, completion, and notes.

Duration/distance exercise modes, timers, offline-first sync, wearables, and live coaching are later slices.

## Suggested hierarchy

```text
WorkoutSession
  id, ownerId, sourceRoutineId?, sourceRoutineName?, status,
  startedAt, completedAt?, timezone, notes?, createdAt, updatedAt

SessionExercise
  id, sessionId, sourceExerciseId?, exerciseNameSnapshot,
  order, prescriptionSnapshotJson, notes?

CompletedSet
  id, sessionExerciseId, order, status,
  loadValue?, loadUnit?, repetitions?, rir?, rpe?,
  durationSeconds?, distanceValue?, distanceUnit?, notes?, completedAt?
```

Retain nullable source IDs for navigation but snapshots are authoritative history. Use explicit snapshot columns for commonly queried values (exercise name, target sets/reps/RIR) and a versioned JSON snapshot for the rest. Do not serialize an entire current Prisma object.

## Domain rules and validation

- Status transitions: `PLANNED/IN_PROGRESS -> COMPLETED|ABANDONED`; corrections after completion use an explicit edit path and audit metadata.
- `completedAt >= startedAt`; timestamps are UTC with the captured display timezone.
- Session/child order is unique and normalized.
- Load/distance use decimal values and explicit units. Store canonical units for analytics or convert at the boundary while preserving entered/display unit.
- Reps are non-negative integers; RIR 0–10; RPE may be decimal steps 1–10 according to a documented policy.
- Completion status distinguishes completed, skipped, and warm-up if warm-up sets are supported.
- A historical record remains readable if the source exercise/routine is archived or deleted.

## Snapshot requirements

At session launch, copy exercise name, ordering, and all relevant routine prescriptions. Optionally copy muscle assignments/profile version only if historical analytics require “as known then”; do not copy every classification without a concrete query. Once complete, routine or exercise edits cannot mutate snapshot columns through cascades.

## API and frontend

Likely commands: launch from routine, create ad hoc, get/list owned sessions, add/update/reorder sets while in progress, complete, abandon, and correct a completed session. Prefer command endpoints for state transitions (`POST /workout-sessions/:id/complete`) over a generic status patch.

UI needs session launcher, active-session screen, set table optimized for mobile input, completion review, history list/detail, unsaved/network indicators, and safe resume. A PWA/offline design is valuable but should be a separate release because conflict resolution is substantial.

## Authorization

Scope every session query to owner. Validate source routine ownership at launch. Child mutations resolve through the owned session; never accept owner IDs. Completed history is private unless a later consent/grant model exists.

## Testing requirements

- State-transition unit tests and correction rules
- Numeric/unit/range validation and decimal precision tests
- Transaction tests for session launch snapshots
- Ownership matrix for session and nested set endpoints
- Critical regression: edit/archive/delete routine/exercise after completion and prove snapshots/results are unchanged
- API E2E for launch, record, complete, resume, abandon, correction
- Mobile component and Playwright tests for rapid set entry, errors, and interrupted requests

## Edge cases

Two tabs editing one session, app closed mid-set, clock/timezone change, duplicate completion request, source routine archived during a session, partial sessions, unit changes, corrections, and account deletion. Add version numbers/idempotency keys before offline/retry-heavy workflows.

## Dependencies and sequence

Requires routines, ownership, stable units, and routine lifecycle decisions. Implement snapshots and launch transaction first, then active recording, completion/history, correction policy, and only then analytics.

## Definition of done

Users can record and retrieve only their sessions; state transitions and units are valid; historical snapshots survive all routine/exercise edits; retries cannot create obvious duplicates; mobile entry is usable; and the preservation regression suite passes.

## Future extensions and open questions

Duration/distance, per-side results, warmups, timers, supersets, offline sync, wearables, imports, and richer session readiness are later. Decide canonical load units, correction/audit policy, and precisely which source data must be snapshotted before schema implementation.

