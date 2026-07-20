# Exercise capability profile

## Purpose and user problem

Describe qualities an exercise can generally help develop without claiming that it produces the same result for every athlete or prescription. Keeping this profile separate from exercise identity allows the classification to evolve and prevents it from being mistaken for performed training data.

## MVP scope

Include one required profile per active exercise with:

- `hypertrophyPotential`
- `maximalStrengthPotential`
- `powerDevelopmentPotential`
- `muscularEndurancePotential`
- `stabilityDevelopmentPotential`
- `typicalLoadability`
- `stretchPositionLoading`
- `shortenedPositionLoading`

All are integers 0–5 using the global scale. Coordination, balance, and mobility are deferred to athletic/general-demand modeling because “demand” and “development potential” are easily confused. If later retained as capabilities, name them `coordinationDevelopmentPotential`, `balanceDevelopmentPotential`, and `mobilityDevelopmentPotential`.

## Out of scope

Personal outcome predictions, scientific certainty, prescription-specific effects, sport ratings, muscle-specific hypertrophy potential, and automatic profile generation.

## User stories

- Users can compare an exercise’s general development strengths with visible caveats.
- Administrators can set every MVP score in one form section and see definitions.
- Filters can find exercises above a named capability threshold.
- The system rejects missing, fractional, or out-of-range values.

## Suggested model

```prisma
model ExerciseCapabilityProfile {
  exerciseId                    String   @id @db.Uuid
  hypertrophyPotential          Int
  maximalStrengthPotential      Int
  powerDevelopmentPotential     Int
  muscularEndurancePotential    Int
  stabilityDevelopmentPotential Int
  typicalLoadability            Int
  stretchPositionLoading        Int
  shortenedPositionLoading      Int
  editorialNotes                String?
  createdAt                      DateTime @default(now()) @db.Timestamptz(3)
  updatedAt                      DateTime @updatedAt @db.Timestamptz(3)
  exercise                       Exercise @relation(fields: [exerciseId], references: [id], onDelete: Cascade)
}
```

Use a one-to-one table rather than JSON so fields are typed, constrained, filterable, documented by OpenAPI, and indexable selectively. Add PostgreSQL checks for every score. Do not index all columns: begin with no capability indexes beyond the primary key, inspect filter/query plans, then add targeted composite indexes such as `(hypertrophy_potential, exercise_id)` only for proven filters.

## Score interpretation

The global 0–5 labels apply, but each field needs help text:

- **Hypertrophy:** practical potential to provide a scalable hypertrophy stimulus.
- **Maximal strength:** suitability for high-force, progressively loaded strength work.
- **Power:** suitability for intentional high-velocity force production.
- **Muscular endurance:** suitability for sustained/repeated local effort.
- **Stability development:** potential to train control against unwanted movement; distinct from stability demand.
- **Typical loadability:** how readily meaningful external load can be increased with consistent technique.
- **Stretch-position loading:** degree of meaningful tension near longer muscle lengths.
- **Shortened-position loading:** degree of meaningful tension near shorter muscle lengths.

The editorial guide should supply anchor examples during catalog curation. Calibration reviews across several exercises are better than treating raters’ isolated values as precise.

## Domain and validation rules

- Integers only, 0–5 inclusive; no nulls for a published exercise.
- A score of 0 means negligible/not applicable, not “unknown.” Unknown draft values must be null only if persistent draft support is later added.
- `editorialNotes` is optional, internal/admin-facing, and at most 2,000 characters.
- Scores describe a documented conventional execution, not every variation.
- Profiles update inside the exercise aggregate transaction.
- The API and UI must distinguish stability **development** from stability **demand**.

## API and frontend

Embed `capabilities` in exercise admin DTOs and details. Filtering syntax should be explicit, for example `minHypertrophyPotential=4`; allowlist only shipped fields and cap combined filters. Do not build a generic client-supplied field/operator query language.

The `CapabilityProfileSection` renders eight labeled 0–5 controls, per-field help, the common legend, keyboard input, and an error summary. Public `CapabilityProfile` uses labeled bars/badges with text equivalents; color alone cannot convey ratings.

## Authorization

Profiles are publicly readable as part of active exercise details. Only administrators can mutate them through exercise aggregate endpoints.

## Testing requirements

- DTO/property tests for every integer and boundary 0/5
- Raw database tests for each representative check constraint (migration SQL itself should be reviewed for all fields)
- Transaction tests: profile failure rolls back exercise/relationships
- API tests for detail shape and supported capability filters
- Component tests for help text, keyboard changes, error association, 0 and 5 labels, and non-color presentation
- Authorization tests for normal-user profile mutation attempts

## Edge cases

Missing profile during legacy migration, score 0 mistaken for unknown, contradictory-looking ratings, renamed fields, and filters across null drafts. MVP avoids null published values and should provide a backfill migration before making new columns required.

## Dependencies and implementation sequence

Depends on exercise identity and global score vocabulary. Add model/check constraints, composed DTO, transactional write, public representation, form section, then filters and calibration seed review.

## Definition of done

Every active exercise has a valid profile; every score has visible meaning; database and API constraints agree; filtering is documented and tested; writes are atomic/admin-only; and deferred fields are absent from MVP forms/contracts.

## Future extensions and open questions

Possible additions are mobility/coordination/balance development, muscle-specific capability notes, profile revision history, and curator confidence. Before adding fields, validate that users can interpret them and that they are not duplicates of demands or athletic qualities. Whether editorial notes become public is an open content decision; keep them internal in MVP.

