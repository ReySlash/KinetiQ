# Domain model overview

## Purpose

This document separates the kinds of data KinetiQ stores so the `Exercise` table never becomes a mixture of identity, prescription, performance, and athlete response.

## Bounded concepts

| Concept | Data character | Owner/lifecycle |
| --- | --- | --- |
| Muscle | Controlled anatomical reference | Internal seed/admin maintenance |
| Exercise | Controlled movement identity | Admin curated |
| ExerciseMuscle | Editorial involvement relationship | Admin curated with exercise |
| ExerciseCapabilityProfile | Relative development potential | Admin curated, one per exercise |
| ExerciseDemandProfile | Relative general demands/costs | Admin curated, one per exercise |
| ExerciseAthleticQuality | General athletic-quality mapping | Later editorial data |
| Routine | Reusable template | One user owner |
| RoutineExercise | Ordered prescription in a routine | Same owner through routine |
| TrainingPlan | Schedule containing routine uses | Later, one user owner |
| WorkoutSession | Historical occurrence | Later, one user owner |
| SessionExercise | Snapshot of planned/performed exercise | Historical child |
| CompletedSet | Actual performance | Historical child |
| RecoveryCheckIn | Athlete response/context | Later, one user owner |

## Relationship map

```text
Muscle ── parent/children
   ▲
   │ ExerciseMuscle (role, involvementScore)
   │
Exercise ──1:1── CapabilityProfile
   │      └─1:1── DemandProfile
   │      └─1:N── Media (deferred; inline thumbnail metadata in MVP)
   │
   └─< RoutineExercise (order, sets, reps, RIR, rest, tempo)
          >─ Routine ── owner User

Routine ──< scheduled use / TrainingPlan (later)
Routine ── creates snapshots ──> WorkoutSession ─< SessionExercise ─< CompletedSet
```

## Core modeling rules

- Use UUIDs (prefer UUIDv7 if supported consistently; otherwise UUIDv4) as internal primary keys and unique slugs for public/editorial lookup.
- Use booleans only for facts such as unilateral or isometric when those facts are truly binary. If a movement can be mixed, use a classification enum instead of multiple conflicting booleans.
- Use enums for stable, code-governing values and reference tables for curated values that need metadata, hierarchy, or filtering changes without a deployment.
- Use explicit join models whenever a relationship has attributes or future meaning.
- Constrain all comparative ratings to integers 0–5 in DTO validation and PostgreSQL `CHECK` constraints.
- Store timestamps in UTC as timezone-aware PostgreSQL timestamps; render in the user’s timezone.
- Do not use floating point for loads or distances. Use database decimals with documented units.
- Do not hard-delete referenced historical identities. Use `archivedAt` or `isActive` for exercises once session history exists.

## Classification decisions

| Value | MVP representation | Reason |
| --- | --- | --- |
| Equipment | Reference table + join | Multi-value, searchable, aliases/metadata likely |
| Movement pattern | Reference table | User-facing taxonomy likely to evolve |
| Body region | Stable Prisma enum initially | Small controlled set used by muscles and filters |
| Broad muscle group | Reference table or seeded self-contained taxonomy | Has labels/order and may evolve |
| Plane of motion | Enum plus exercise join only when implemented | Stable vocabulary; exercise can be multiplanar |
| Skill level | Prisma enum | Stable ordered classification |
| Muscle role | Prisma enum | Domain invariant (`PRIMARY`, `SECONDARY`, `STABILIZER`) |
| Exercise relationship type | Prisma enum when feature ships | Behavior is code-governed |
| Progression type | Prisma enum when routine progression ships | Behavior is code-governed |
| Visibility | Prisma enum | Authorization behavior depends on it |

Do not create CRUD screens for enum-like reference data. Seed and maintain equipment/movement patterns through reviewed data changes until non-developer editing becomes a real need.

## Exercise classification recommendation

Prefer single enums for `forceType` (`PUSH`, `PULL`, `STATIC`, `OTHER`), `kineticChain` (`OPEN`, `CLOSED`, `MIXED`), `laterality` (`UNILATERAL`, `BILATERAL`, `ALTERNATING`, `OTHER`), and `contractionMode` (`DYNAMIC`, `ISOMETRIC`, `MIXED`). A `compound` boolean is acceptable because it is a true two-way editorial classification. Body position may be a small reference table if multiple positions per exercise are expected; for MVP, use one enum value with `OTHER`.

## Raw, derived, heuristic, and recommendation data

- **Raw stored data:** completed sets, check-ins, routine prescriptions, and curated exercise ratings.
- **Derived metrics:** deterministic outputs such as weekly completed set count or volume load. Compute on read initially.
- **Heuristic estimates:** estimated 1RM, indirect muscle set equivalents, and fatigue exposure. Return method/version and assumptions.
- **Recommendations:** user-facing actions built from rules and data sufficiency checks. Store the user’s response and optionally the issued recommendation, not every intermediate calculation.

Materialized aggregates are deferred until query measurements show a need. If cached, retain the calculation version and ability to rebuild from raw data.

## Aggregate transaction boundaries

- Creating/updating an exercise with assignments and profiles is one transaction.
- Creating/updating a routine and its prescription children is one transaction when submitted as a full form.
- Media object upload is not transactionally atomic with PostgreSQL; use a staged/finalized workflow and cleanup states.
- Recording a completed session should commit the session snapshots and initial sets atomically where practical.

## Cross-domain authorization

Reference reads are public. Reference writes are administrator-only. User resources are always queried with both resource identifier and `ownerId`, except explicitly public future resources. Child resources are mutated through their owned parent; never trust an owner ID supplied by the client.

## Dependencies and open questions

Exact taxonomy seeds and UUID choice should be settled before the first migration. Sport mappings, custom exercises, and coach tenancy are intentionally modeled only at the boundary level until their user workflows are validated.

