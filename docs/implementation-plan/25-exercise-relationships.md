# Exercise relationships

## Purpose and status

Allow users to navigate meaningful alternatives without embedding many nullable “alternative exercise” columns. This feature is post-MVP; the initial catalog and routine builder do not need it, but the future model must support typed, directed, editorial relationships.

## Relationship types

- Variation
- Progression
- Regression
- Substitute
- Machine alternative
- Free-weight alternative
- Lower-fatigue alternative
- Lower-skill alternative
- Unilateral alternative
- Bilateral alternative

## User problem and stories

Users eventually need a replacement when equipment, skill, recovery, or programming goals change. A curator needs to express direction and rationale. A routine user should be able to replace one prescription while preserving its sets/reps and explicitly accepting any incompatibility warning.

## Suggested model

```prisma
model ExerciseRelationship {
  id               String                   @id @db.Uuid
  sourceExerciseId String                   @db.Uuid
  targetExerciseId String                   @db.Uuid
  type             ExerciseRelationshipType
  notes            String?
  sortOrder         Int                      @default(0)
  createdAt         DateTime                 @default(now()) @db.Timestamptz(3)
  updatedAt         DateTime                 @updatedAt @db.Timestamptz(3)

  @@unique([sourceExerciseId, targetExerciseId, type])
  @@index([sourceExerciseId, type, sortOrder])
  @@index([targetExerciseId, type])
}
```

Both foreign keys reference `Exercise` with `onDelete: Restrict` once published references exist. Use a Prisma enum for relationship type because direction/inverse behavior is code-governed. The surrogate ID supports audit and future metadata; the compound unique constraint prevents exact duplicates.

## Domain rules

- Source and target cannot be the same; add DTO and PostgreSQL `CHECK` constraints.
- Direction is explicit. `PROGRESSION`, `REGRESSION`, `LOWER_FATIGUE`, and `LOWER_SKILL` are directional.
- Variation/substitute may be conceptually symmetric, but store one canonical row and have the service return its reverse only if the type policy says so. Do not create uncontrolled mirror rows.
- Progression and regression are inverses; similarly machine/free-weight and unilateral/bilateral alternatives may use inverse mappings. Define an inverse table in code and create/update inverse behavior transactionally if rows are materialized.
- Cycles are acceptable for variations/substitutes but progression graphs should warn on cycles. Do not promise a strict universal progression ladder.
- Both exercises must be active to create a new public relation; archived targets remain readable on old relations.
- Notes explain why the relationship applies and any important equipment/technique difference.

## API and frontend

Public exercise details may embed grouped relationship summaries or expose `GET /api/v1/exercises/:id/relationships?type=`. Admin routes can manage relationships as a section of exercise editing or dedicated subresources. Recommendation: dedicated `POST/PATCH/DELETE /api/v1/admin/exercise-relationships` endpoints because inverse/cycle rules span two exercises and should not complicate the core exercise transaction.

Public UI groups alternatives by human-readable purpose. Admin UI searches a target, prevents self/duplicates, shows inferred inverse, detects cycle warnings, and requires notes for directional recommendations. Routine replacement is a later command that copies compatible prescription fields and asks the user to confirm.

## Authorization and validation

Public users read active relations. Administrators/curators mutate them. Validate enum, UUIDs, self-pair, duplicate, active endpoints, note length, and inverse rules. Normal routine owners cannot edit global relationships.

## Testing requirements

- Database tests for duplicate and self-pair constraints
- Unit tests for direction/inverse policy and progression-cycle detection
- Transaction tests for mirrored/inverse creation and deletion if materialized
- API authorization and archived-target behavior
- Component tests for target exclusion, warnings, grouping, and keyboard search
- Routine replacement E2E later proves prescription copying does not mutate the original routine item or exercise

## Edge cases

Two types between the same pair, conflicting progression directions, cycles, archive/delete, duplicates entered from the reverse side, a target that requires different prescription modality, and curator disagreement. Keep relationship notes and allow multiple types; do not auto-replace routines without confirmation.

## Dependencies and implementation sequence

Requires a mature exercise catalog and admin auth. Define type direction/inverse policy, migrate constraints, implement query/service rules, build curator UI, add public display, then optionally integrate routine replacement.

## Definition of done

Relationships are typed, constrained, directionally correct, admin-managed, accessible in public detail, and tested for duplicates/self/cycles/inverses. No relationship is treated as an automatic personalized recommendation.

## Open questions and future extensions

Decide which types are symmetric/materialized, whether confidence/evidence is needed, and whether relations attach to an exercise execution variant. Later add user-specific equipment availability and replacement suggestions using these curated edges plus prescription compatibility.

