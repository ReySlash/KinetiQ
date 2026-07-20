# Training plans and weekly scheduling

## Purpose and status

A training plan arranges reusable routines over time. It solves planning and adherence questions but is a post-MVP feature because routine ownership and stable template behavior must exist first.

## Proposed first slice

Support one owned plan with name, optional date range, timezone, status, and weekly schedule entries that reference routines. An entry specifies weekday, ordering/time hint, and optional notes. Copy routine identity into a lightweight scheduled snapshot only when launching a session; editing a routine before performance may intentionally update the planned template unless a plan-version feature is added.

## Out of scope for first plan slice

Periodization algorithms, multi-week rotating blocks, automatic progression, coach assignments, calendar-provider sync, notifications, availability optimization, and performed data.

## User stories

- A user can create a plan and place owned routines on weekdays.
- A user can pause/archive a plan without deleting routines.
- A user cannot schedule another user’s private routine.
- Timezone/date behavior is clear around travel and daylight-saving transitions.

## Suggested models

```text
TrainingPlan(id, ownerId, name, description?, startDate?, endDate?, timezone,
             status[DRAFT|ACTIVE|PAUSED|ARCHIVED], createdAt, updatedAt)
PlanScheduleEntry(id, planId, routineId, weekday, order, localTime?, notes?)
```

Use a surrogate entry ID and unique `(planId, weekday, order)`. `weekday` is an enum or integer 1–7 with an explicit ISO-8601 mapping. Store date-only fields as PostgreSQL `date`, local time as `time`, and an IANA timezone such as `Asia/Qatar`; do not convert recurrence intent into UTC timestamps prematurely.

## Domain and validation rules

- One user may have many plans, but first UI may allow one `ACTIVE` plan. Enforce a partial unique index on `ownerId WHERE status='ACTIVE'` only if product behavior commits to that rule.
- `startDate <= endDate`; timezone must be in the server-supported IANA set.
- The entry’s routine and plan must share the authenticated owner.
- A day may have multiple entries with contiguous order.
- Archived/deleted routines remain represented or block deletion according to the routine lifecycle decision; recommendation: archive routines once plans ship and retain the reference.
- Plan edits do not rewrite completed sessions.

## API and frontend

Likely routes: owned `/training-plans` CRUD, `/training-plans/:id/entries`, and activation/pause commands. A full aggregate `PATCH` is acceptable for a small weekly editor. UI pages include plan list, weekly grid/editor, plan detail, routine picker, timezone/date fields, and accessible non-drag reorder controls.

## Authorization

All plan and entry queries are scoped by `ownerId`. When attaching a routine, validate it with `(routineId, ownerId)` in the same transaction. Future coach access uses grants, not owner substitution.

## Testing requirements

Test date ranges, ISO weekdays, timezone validation, duplicate order, atomic entry replacement, routine/plan owner mismatch, cross-user access, pause/archive, responsive weekly UI, keyboard ordering, and preservation of completed session data after plan/routine edits.

## Dependencies and sequence

Requires authenticated routines and the final routine archive policy. Build the owned plan aggregate, weekly entries, activation rules, list/editor UI, then session launch integration in the session phase.

## Definition of done

A user can reliably schedule only owned routines in a timezone-aware weekly plan; constraints prevent conflicting positions; activation/archive behavior is explicit; authorization tests pass; and no historical performance model is prematurely mixed into scheduling.

## Future extensions and open questions

Multi-week blocks, exceptions on actual dates, deload weeks, calendar sync, reminders, plan versions, and coach-authored plans are later. Decide whether schedule entries track live routine edits or lock a routine revision; recommendation: live reference until a session is launched, with an explicit “duplicate routine before changing an active plan” UX if users need stable versions.

