# Analytics and recommendations

## Purpose and status

Analytics turn historical training into understandable summaries. They are part of the MVP and depend on trustworthy completed-session data. Initial metrics must be deterministic, explainable, and reproducible.

The Phase 8 standalone session slice and Phase 8.5 adopted-program integration
are implemented with owner-isolation, snapshot, transaction, and journey
coverage. The approved next product slice is a deterministic, read-only Phase 9
overview. Analytics consume workout history; they do not redefine its write
model and do not require a domain layer or write/update flows in this release.

## Data categories

| Category           | Examples                                                   | Persistence policy                                                   |
| ------------------ | ---------------------------------------------------------- | -------------------------------------------------------------------- |
| Raw stored data    | Completed sets, session timestamps, RIR, routine snapshots | Persist as source of truth                                           |
| Derived metric     | Sessions/week, volume load, exercise frequency             | Compute on read initially                                            |
| Heuristic estimate | e1RM, indirect muscle set equivalents, fatigue exposure    | Compute with method/version and caveat                               |
| Recommendation     | Increase load, hold, deload consideration                  | Issue only with data sufficiency; persist decision/audit if acted on |

Do not store every chart point or aggregate until performance measurements justify caching. Any materialization must be rebuildable from raw data and keyed by algorithm version.

## Approved first analytics release

The first release exposes one owner-scoped overview containing:

- completed workout count;
- distinct training-day count;
- completed working-set and warm-up-set counts;
- total repetitions from completed working sets;
- eligible external-load volume in kilograms;
- weekly completed-workout activity;
- active and complete week counts plus average workouts per complete week;
- exercise frequency grouped by stable exercise ID.
- four most recently completed workouts in the selected period;
- maximum eligible external load and the latest completed working set for each
  exercise;
- the current exercise slug for navigation, while stable exercise ID remains
  the grouping key.

Estimated 1RM, personal records, strength trends, muscle-set estimates,
adherence scoring, fatigue/readiness models, and recommendations are deferred to
separately approved contracts.

## Approved period and inclusion rules

- The default period is the current local week plus the previous three weeks
  (four local weeks total).
- A custom range is bounded to 52 weeks.
- Custom range boundaries are inclusive: sessions with `startedAt` equal to
  either `from` or `to` are included. Adjacent ranges may therefore overlap at
  a shared boundary instant by design.
- Weeks run Monday 00:00 through Sunday 23:59:59 in a required valid IANA
  timezone.
- Only `COMPLETED` sessions are eligible. `IN_PROGRESS` and `CANCELLED`
  sessions are excluded.
- Session status determines eligibility; the local date of `startedAt`
  determines the training day and week.
- Program skips are not workouts and do not contribute to analytics.
- The partial current week appears in the weekly series but is excluded from
  complete-week averages and ratios.
- Comparison data uses the immediately preceding, non-overlapping interval with
  the same inclusive local-wall-clock duration. At timezone discontinuities,
  nonexistent local times resolve to the first valid instant afterward and
  ambiguous local times resolve to the earliest instant; exact duration
  equality is therefore not always possible at those boundaries.

## Approved set, volume, and completeness rules

- A working set is a completed set where `isWarmup` is `false`.
- Warm-up sets are excluded from working-set, repetition, and volume totals and
  are reported separately.
- Volume is the sum of `loadKg × repetitions` for eligible working sets with a
  positive external load and positive repetitions.
- Missing or zero load is not interpreted as zero-volume training. Such sets
  remain visible in working-set/repetition totals but are excluded from volume.
- Volume responses include the calculated decimal-safe kilogram value rounded
  to two decimal places, included and excluded set counts, and a completeness
  status of `COMPLETE`, `PARTIAL`, or `UNAVAILABLE`.
- Bodyweight, assisted-load, and unloaded-exercise volume remain deferred until
  their semantics are separately approved.

## Approved exercise-frequency rules

Exercise frequency groups history by stable `exerciseId`. Each item reports
completed workout count, completed working-set count, total repetitions,
eligible volume, volume completeness, maximum eligible external load, and the
latest completed non-warm-up set. Maximum load requires positive repetitions
and positive external load; it is `null` when no set qualifies. The latest set
is selected by completion time, set order, and stable set ID, even when its
load or repetitions are zero. The display name is the most recent historical
exercise-name snapshot in the selected period and `exerciseSlug` is navigation
metadata.

## Program progress versus adherence

The analytics overview does not expose an adherence score. The current model
has relative program positions but no scheduled calendar dates or dedicated
occurrence-resolution timestamps, so on-schedule adherence cannot be derived
honestly. The adopted-program read model remains authoritative for completed,
skipped, resolved, and progress counts. A skipped occurrence counts as resolved
program progress but never as completed training.

## Metric definitions

Every metric specification must state input rows, inclusion/exclusion rules, timezone/week boundary, units, formula, rounding, missing-data behavior, minimum sample size, and version. Warm-ups, skipped sets, unilateral load conventions, bodyweight exercises, assisted load, and duration work need explicit treatment rather than silent assumptions.

Weekly muscle sets should distinguish direct/primary and indirect/secondary/stabilizer contributions. Recommendation: initially report raw completed exercise sets grouped by assignment role rather than convert them into fractional “effective sets.” If fractional weighting is added, label it a heuristic and expose weights/version.

The derivation path is:

```text
CompletedSet
    ↓
ExercisePerformance
    ↓
Exercise
    ↓
ExerciseMuscle (role, involvementScore)
```

Suitable language includes “muscle exposure,” “weighted set exposure,”
“training distribution,” and “estimated muscle-set equivalents.” Do not present
involvement-based output as physiologically exact effective sets. Possible later
views include primary/secondary exposure, weekly muscle distribution, movement-
pattern distribution, and weighted muscle-set exposure; user-visible heuristics
should identify their method and assumptions.

## Architecture

Create an `AnalyticsModule` with application use cases, read models, calculation
functions, an owner-scoped query port, a Prisma adapter, and HTTP presentation.
No analytics domain layer or command port is required for this read-only slice.
Use SQL aggregation for simple counts and pure application functions for
deterministic grouping. Add persistence or materialization only when measured
query performance justifies it.

API examples:

- `GET /api/analytics/overview?from=&to=&timezone=`
- `GET /api/analytics/exercises/:exerciseId?from=&to=` (later)
- `GET /api/analytics/muscles?from=&to=&method=role-count-v1` (later)

The overview requires a valid IANA timezone, defaults to four local weeks, and
accepts a maximum 52-week range. Include period metadata and volume-completeness
information in the response.

The approved response contract is:

```ts
type AnalyticsOverview = {
  period: {
    from: string;
    to: string;
    timezone: string;
    includesPartialCurrentWeek: boolean;
  };
  totals: {
    completedWorkouts: number;
    trainingDays: number;
    completedWorkingSets: number;
    warmupSets: number;
    totalRepetitions: number;
    volumeLoadKg: string | null;
    activeWeeks: number;
    completeWeeks: number;
    averageWorkoutsPerCompleteWeek: number;
  };
  volumeCompleteness: {
    status: "COMPLETE" | "PARTIAL" | "UNAVAILABLE";
    includedSetCount: number;
    excludedSetCount: number;
  };
  weekly: WeeklyTrainingSummary[];
  exercises: ExerciseFrequencySummary[];
  recentWorkouts: RecentWorkoutSummary[];
  comparison: {
    period: { from: string; to: string };
    totals: AnalyticsOverview["totals"];
    volumeCompleteness: AnalyticsOverview["volumeCompleteness"];
  };
};
```

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
