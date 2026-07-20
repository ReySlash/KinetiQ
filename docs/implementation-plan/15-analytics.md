# Analytics and recommendations

## Purpose and status

Analytics turn historical training into understandable summaries. They are post-MVP because trustworthy calculations require stable completed-session data. Initial metrics must be deterministic, explainable, and reproducible.

## Data categories

| Category | Examples | Persistence policy |
| --- | --- | --- |
| Raw stored data | Completed sets, session timestamps, RIR, routine snapshots | Persist as source of truth |
| Derived metric | Sessions/week, volume load, exercise frequency | Compute on read initially |
| Heuristic estimate | e1RM, indirect muscle set equivalents, fatigue exposure | Compute with method/version and caveat |
| Recommendation | Increase load, hold, deload consideration | Issue only with data sufficiency; persist decision/audit if acted on |

Do not store every chart point or aggregate until performance measurements justify caching. Any materialization must be rebuildable from raw data and keyed by algorithm version.

## First analytics release

- Sessions completed and workout consistency by week
- Exercise frequency
- Completed working sets and volume load (`sets` are not multiplied; `load × reps` per completed set where meaningful)
- Estimated 1RM for supported loaded exercises with one named formula and visible limitations
- Personal records by a defined category
- Strength trend using e1RM or best comparable set
- Routine adherence when a schedule exists

Muscle-set estimates, demand exposure, stagnation, movement balance, and recommendations follow after the base calculations are validated.

## Metric definitions

Every metric specification must state input rows, inclusion/exclusion rules, timezone/week boundary, units, formula, rounding, missing-data behavior, minimum sample size, and version. Warm-ups, skipped sets, unilateral load conventions, bodyweight exercises, assisted load, and duration work need explicit treatment rather than silent assumptions.

Weekly muscle sets should distinguish direct/primary and indirect/secondary/stabilizer contributions. Recommendation: initially report raw completed exercise sets grouped by assignment role rather than convert them into fractional “effective sets.” If fractional weighting is added, label it a heuristic and expose weights/version.

## Architecture

Create an `AnalyticsService` that queries owned completed sessions through read repositories and returns calculation metadata. Pure calculation functions receive normalized inputs and are extensively unit/property tested. Use SQL aggregation for simple counts; use application functions for versioned formulas. Add a background/materialized layer only when measured ranges exceed acceptable latency.

API examples:

- `GET /api/v1/analytics/overview?from=&to=&timezone=`
- `GET /api/v1/analytics/exercises/:exerciseId?from=&to=`
- `GET /api/v1/analytics/muscles?from=&to=&method=role-count-v1` (later)

Use bounded default/max date ranges. Include `calculation` metadata and `dataCompleteness` flags in responses.

## User-facing presentation

Dashboard cards should link to definitions and source sessions. Charts require text summaries, accessible labels, correct empty/insufficient-data states, and non-deceptive axes. Separate “You recorded…” facts from “This may suggest…” interpretations. Users should be able to inspect the input set for a PR or recommendation.

## Progression recommendations

First recommendations should be rules-based, for example a double-progression rule configured on a routine item: if all target sets reach the upper rep bound at or above target RIR for two comparable sessions, suggest a small load increase. Show the evidence, rule version, and alternatives; let the user accept/dismiss. Never automatically rewrite future prescriptions without confirmation.

Recovery/fatigue recommendations require subjective check-ins, recent prescription/performance, and explicit uncertainty. Exercise `systemicFatiguePotential` alone cannot determine athlete fatigue.

## Authorization and privacy

Analytics queries are always owner-scoped and must not accept an arbitrary user ID. Cached rows include owner ID and inherit deletion/export rules. Later coaches need explicit grants and audit trails. Avoid analytics/event tools receiving health-like notes or detailed set payloads unless contract/privacy controls permit it.

## Testing requirements

- Golden fixture tests for each published formula and version
- Property tests for unit conversion, range boundaries, monotonicity where expected, and no divide-by-zero
- Timezone/week/DST tests
- Inclusion tests for skipped/warm-up/incomplete/corrected sets
- Authorization and cache-isolation tests
- API tests for invalid/large ranges and insufficient data
- Frontend tests for empty/partial/error states, chart accessibility, definition/source links
- Regression tests ensure routine edits do not change metrics derived from snapshots

## Edge cases

Missing load, mixed units, assisted/bodyweight load, one-sided exercises, corrected/deleted sessions, exercise renames, partial weeks, travel timezone, sparse data, outliers, formula changes, and archived exercises. Return “not available” rather than a misleading zero.

## Dependencies and implementation sequence

Requires completed session history and a units policy. Specify one metric, fixtures, pure calculation, API, explanation UI, and acceptance tests at a time. Ship overview counts before heuristics; ship recommendations only after users can audit underlying metrics.

## Definition of done

Each released metric is reproducible from raw owned data, documented and versioned where heuristic, handles missing data, has golden/timezone/authorization tests, and is clearly separated from recommendations. No opaque composite fitness/fatigue score is introduced.

## Future extensions and open questions

Movement balance, axial exposure, sport-quality exposure, stagnation, recovery trends, cohort comparisons, and predictive models are later. Open decisions include formula choice, working-set classification, bodyweight load conventions, and privacy classification. AI is explicitly outside the first recommendation releases.

