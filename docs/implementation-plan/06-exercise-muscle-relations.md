# Exercise–muscle relationships

## Purpose and user problem

Represent which muscles an exercise involves without flattening the relationship into arrays or columns. The role and degree of involvement belong to the exercise–muscle pair and support clear display and later explainable volume estimates.

## Scope

The MVP supports many muscles per exercise, roles `PRIMARY`, `SECONDARY`, and `STABILIZER`, one integer involvement score from 0–5, transactional editing with the exercise, filters, and duplicate prevention.

## Out of scope

Individual-specific activation, EMG data, regional muscle subdivisions beyond the seeded library, prescription-specific involvement, automatic assignment, and analytics weighting are excluded. A score is editorial, not a physiological measurement.

## User stories

- An administrator can add several distinct muscles, set role and involvement, reorder the form, and remove assignments.
- The selector prevents choosing the same muscle twice.
- A user sees primary, secondary, and stabilizer muscles with an understandable rating label.
- A failed or duplicate assignment cannot leave the exercise partially updated.

## Suggested model

```prisma
model ExerciseMuscle {
  exerciseId       String     @db.Uuid
  muscleId         String     @db.Uuid
  role             MuscleRole
  involvementScore Int
  notes            String?
  createdAt        DateTime   @default(now()) @db.Timestamptz(3)
  updatedAt        DateTime   @updatedAt @db.Timestamptz(3)
  exercise         Exercise   @relation(fields: [exerciseId], references: [id], onDelete: Cascade)
  muscle           Muscle     @relation(fields: [muscleId], references: [id], onDelete: Restrict)

  @@id([exerciseId, muscleId])
  @@index([muscleId, role])
  @@index([exerciseId, role])
}
```

The compound primary key is the decisive duplicate constraint. Do not include `role` in it: the same muscle cannot be both primary and stabilizer for one exercise. Add a PostgreSQL check through a SQL migration: `involvement_score BETWEEN 0 AND 5`. Prisma/DTO validation duplicates this rule for good errors.

## Domain rules and validation

- Every active exercise requires at least one `PRIMARY` muscle before publication.
- Score must be an integer 0–5. Score 0 explicitly means assessed as negligible/not applicable; it is distinct from a missing assignment. Because the project requires one consistent scale, PostgreSQL and DTOs allow both 0 and 5. The editor warns that a zero-valued assignment is usually unnecessary but does not silently remove it.
- A primary role should normally score 3–5; secondary 1–4; stabilizer 1–4. Treat these as admin warnings, not hard constraints, because valid exceptions exist.
- Only active muscles may be newly assigned. Existing assignments to later-inactive muscles remain readable.
- Assigning both a parent muscle and its child can double-count later analytics. MVP form should warn and require editorial resolution, not ban it universally.
- Do not infer role automatically from score.

## API contract

Assignments are embedded in exercise create/detail/update:

```json
{
  "muscles": [
    { "muscleId": "uuid", "role": "PRIMARY", "involvementScore": 5 }
  ]
}
```

Exercise update treats the supplied `muscles` array as the desired complete set. Omitted property means “unchanged” for PATCH; an explicitly empty array fails the active-exercise primary-muscle rule. The service validates all muscle IDs with one query and performs the diff in the exercise transaction.

Filtering uses `GET /exercises?muscle=<slug>&muscleRole=PRIMARY`; repeated muscle parameters may use documented `match=any|all` later. Do not add independent `/exercise-muscles` CRUD endpoints for MVP.

## Frontend components

`MuscleInvolvementEditor` contains an accessible muscle combobox, role select, 0–5 rating input with labels, remove action, duplicate/parent-child warning, and grouped summary. Newly selected muscles are removed from available options. Use stable field-array keys rather than array indexes.

Public exercise detail groups assignments by role and links each muscle. Do not display a bare number without its label and caveat.

## Authorization

Public users can read assignments through public exercises. Only an administrator can mutate them, and mutations occur only through an authorized exercise aggregate service. Muscle IDs from the client never grant mutation access.

## Testing requirements

- DTO tests reject fractional values, values below 0/above 5, invalid roles, duplicates, unknown/inactive muscles, and no primary muscle.
- Database integration tests prove the compound key prevents duplicates even under concurrent requests and the score check rejects invalid direct writes.
- Service tests prove create/update rollback if any assignment fails.
- API E2E tests cover replacement semantics and conflict/validation responses.
- Component tests cover keyboard selection, field-array removal/reorder, duplicate exclusion, score help, parent-child warning, and server error focus.
- A later analytics contract test must ensure parent/child assignments are not double-counted silently.

## Edge cases

Concurrent editors, a muscle deactivated during edit, duplicate IDs with different roles, parent and child together, score zero, archived exercises, and seeded muscle ID changes. Stable IDs and database constraints are the final defense.

## Dependencies and implementation sequence

Depends on muscle and exercise identity. Add the join migration and check, then DTO/domain validation, transactional service integration, editor component, public rendering/filter, and full tests in that order.

## Definition of done

Duplicate pairs are impossible in PostgreSQL; all scores are valid; active exercises have a primary assignment; aggregate writes are atomic; role groupings are accessible; public filtering works; and negative tests cover both validation and authorization.

## Future extensions and open questions

Future records might add involvement evidence/notes, movement-phase involvement, or catalog versioning. Do not add a universal “set credit” column; analytics should apply a named/versioned heuristic. Review zero-valued assignments during editorial calibration, while keeping the required 0–5 constraint consistent.
