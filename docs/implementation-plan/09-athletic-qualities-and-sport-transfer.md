# Athletic qualities and sport transfer

## Purpose and modeling decision

Avoid a misleading universal “sport transfer” score. General athletic qualities describe broad characteristics of an exercise; sport-specific relevance is a separate relationship whose value depends on a sport, role, preparation phase, execution, and confidence.

## Scope by phase

This entire domain is outside the production MVP. The architecture reserves names and relationship boundaries but does not create tables, endpoints, filters, or form sections yet. The first later slice may add general athletic qualities. Sport-specific mappings come only after a controlled sport taxonomy and a validated user need.

## General qualities considered

- Force production
- Rate of force development
- Acceleration and deceleration
- Rotational-force and anti-rotational strength
- Unilateral- and bilateral-force production
- Reactive strength
- Grip transfer
- Trunk-stability transfer
- Vertical- and horizontal-force orientation
- Overhead-force production

Use an explicit join instead of adding 13 nullable columns if the set is expected to change:

```prisma
model ExerciseAthleticQuality {
  exerciseId String @db.Uuid
  quality    AthleticQuality
  score      Int
  notes      String?

  @@id([exerciseId, quality])
  @@index([quality, score])
}
```

Recommendation: use a Prisma enum for `AthleticQuality` initially because each quality requires curated definitions and UI copy. Move to a reference table only if administrators truly need to add qualities without a release. Score checks remain 0–5, and absent rows mean “not assessed,” while score 0 means assessed as negligible.

## Sport-specific model

```prisma
model ExerciseSportRelevance {
  exerciseId             String @db.Uuid
  sportId                String @db.Uuid
  generalPreparationValue Int
  directTransferValue     Int
  confidenceLevel         ConfidenceLevel
  notes                    String?

  @@id([exerciseId, sportId])
  @@index([sportId, directTransferValue])
}
```

`Sport` should be a seeded reference table, potentially with disciplines/positions later. Confidence is an enum such as `LOW`, `MODERATE`, `HIGH`, not another pseudo-precise numeric score. The two values are editorial 0–5 ratings and must state the assumed athlete level and exercise execution in notes where relevant.

## Domain rules

- General qualities and sport relevance cannot be inferred from each other automatically.
- “Direct transfer” is not a promise that the exercise improves competition performance.
- A missing quality/mapping means unassessed, not zero.
- Duplicate exercise–quality and exercise–sport pairs are prevented by compound keys.
- Sport relevance requires notes, confidence, and an editorial review date/source policy before public launch.
- No athlete performance recommendation may use these ratings alone.

## Possible user stories

- A user can see which broad athletic qualities an exercise exposes without a universal transfer score.
- A qualified curator can explain why an exercise has preparation value for a sport.
- A user can filter by one general quality while still seeing the methodology caveat.

## Later API and frontend

General qualities may be embedded in exercise detail/admin edits and filtered explicitly. Sport mappings should use admin subresources such as `PUT /api/v1/admin/exercises/:exerciseId/sports/:sportId`, because their review lifecycle may differ from the core exercise aggregate. Public sport pages should not launch until coverage is sufficient to avoid biased comparisons.

Add form sections only when the corresponding release ships. Present score labels, notes, confidence, and last-reviewed metadata. Never combine qualities into a single colored “athletic score.”

## Authorization and testing

Public read is optional after editorial review; administrator/curator role is required for writes. Tests must cover score checks, duplicate mappings, missing versus zero semantics, confidence requirements, unsupported sports, authorization, filter behavior, accessible caveats, and the absence of a universal aggregate score.

## Dependencies and implementation sequence

Requires a mature exercise library and documented curation rubric. Sport mappings additionally require sport taxonomy, editorial ownership, and evidence/content policy. Pilot 10–20 exercises internally, calibrate ratings, then decide whether user value warrants full catalog work.

## Definition of done for a future slice

Definitions and examples are published; ratings are constrained and reviewed; missing values are distinct from zero; no universal transfer score exists; filters and API are documented; curator permissions and audit metadata work; and user copy avoids causal performance claims.

## Open questions

Who is qualified to curate ratings, whether sources are cited, whether positions/events need separate mappings, how often review occurs, and whether general qualities belong on an exercise or a specific execution variant all remain unresolved. These uncertainties are the reason to defer the feature.

