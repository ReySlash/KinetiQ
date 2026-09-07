This catalog records the reviewed analytics implementation, its approved planning documentation, and confirmed QA contract decisions.

Sources included [15-analytics.md](/Users/reynaldocarmenatearias/Documents/Projects/KinetiQ/docs/implementation-plan/15-analytics.md), the [analytics module](/Users/reynaldocarmenatearias/Documents/Projects/KinetiQ/apps/api/src/modules/analytics), and the workout-session persistence/domain contracts.

## Boundary conditions

### BC-01 — Equal or reversed date boundaries

- **ID:** BC-01
- **Category:** Boundary conditions
- **Risk:** An empty or reversed range could produce misleading buckets or unexpected database results.
- **Input that exposes it:** `from === to`, or `from > to`.
- **Current behavior observed in the code:** `resolveAnalyticsOverviewQuery` rejects both cases because it requires `from < to`.
- **Recommended expected contract:** The start must strictly precede the end; equal and reversed ranges return a validation error.
- **Contract status:** Confirmed
- **Why it matters:** All period totals and complete-week calculations depend on a non-empty chronological interval.

### BC-02 — Sessions exactly on range boundaries

- **ID:** BC-02
- **Category:** Boundary conditions
- **Risk:** A session could be counted twice in adjacent requests or omitted unexpectedly.
- **Input that exposes it:** One session with `startedAt === from` and another with `startedAt === to`.
- **Current behavior observed in the code:** The Prisma query uses an inclusive interval: `startedAt >= from` and `startedAt <= to`. The partial-current-week expression also includes the case where `to` equals the current local week's starting instant.
- **Recommended expected contract:** Both boundaries are inclusive: sessions with `startedAt === from` or `startedAt === to` are included. Consequently, adjacent ranges that share a boundary instant can both include a session at that instant; this overlap is intentional. When `to` equals the current local week's starting instant, `includesPartialCurrentWeek` is `true` because that inclusive instant belongs to the current week.
- **Contract status:** Confirmed
- **Why it matters:** Boundary semantics must be predictable for dashboards, exports, and comparisons between periods.

### BC-03 — Default period at exactly Monday midnight

- **ID:** BC-03
- **Category:** Boundary conditions
- **Risk:** The documented four-week default series may contain only three weekly buckets at one exact boundary.
- **Input that exposes it:** `now` exactly equal to Monday `00:00:00.000` in the requested timezone, with no custom dates.
- **Current behavior observed in the code:** `to` equals the new week’s start and inclusive bucket construction includes an empty bucket for that week. `includesPartialCurrentWeek` is true because the inclusive endpoint belongs to the current week.
- **Recommended expected contract:** The default response should consistently represent the current local week plus the previous three weeks, including an empty current-week bucket at its starting instant.
- **Contract status:** Confirmed
- **Why it matters:** The weekly series should not change shape solely because a request happens at an exact week boundary.

### BC-04 — Maximum range across timezone offset changes

- **ID:** BC-04
- **Category:** Boundary conditions
- **Risk:** A local-calendar range described as 52 weeks could be accepted or rejected based on elapsed UTC milliseconds.
- **Input that exposes it:** A 52-local-week range whose endpoints have different UTC offsets because of DST or another timezone offset change.
- **Current behavior observed in the code:** The maximum is enforced by comparing the endpoints' millisecond-precise local wall-clock values, so timezone offset changes do not alter the 364-local-day limit.
- **Recommended expected contract:** The maximum range is 52 local calendar weeks in the requested IANA timezone. Timezone offset changes must not cause an otherwise valid 52-local-week range to be rejected.
- **Contract status:** Confirmed
- **Why it matters:** The current implementation and user-facing calendar terminology may disagree at timezone boundaries.

### BC-05 — Zero repetitions with positive load

- **ID:** BC-05
- **Category:** Boundary conditions
- **Risk:** An ineligible set is reported as included volume data, potentially changing completeness from `UNAVAILABLE` or `PARTIAL` to `COMPLETE`.
- **Input that exposes it:** A non-warm-up completed set with `repetitions: 0` and `loadKg: "100.00"`.
- **Current behavior observed in the code:** The set remains a working set but is excluded from volume because eligibility requires positive load and positive repetitions.
- **Recommended expected contract:** Volume eligibility requires both positive load and positive repetitions. A zero-repetition set remains a working set but is excluded from volume.
- **Contract status:** Confirmed
- **Why it matters:** The approved volume contract explicitly requires positive values for both factors.

### BC-06 — DST training-day and week boundaries

- **ID:** BC-06
- **Category:** Boundary conditions
- **Risk:** Sessions around clock changes could be assigned to the wrong local day or weekly bucket.
- **Input that exposes it:** Sessions immediately before and after spring-forward or fall-back transitions in the requested timezone.
- **Current behavior observed in the code:** Calendar keys and Monday boundaries are derived through `Intl.DateTimeFormat` and local-calendar conversion rather than fixed 24-hour bucket arithmetic.
- **Recommended expected contract:** Training days and Monday–Sunday weeks must remain based on local calendar dates across DST changes.
- **Contract status:** Confirmed
- **Why it matters:** The documentation explicitly defines training days and weeks in the user-provided timezone.

### BC-07 — A 52-week duration spanning 53 weekly buckets

- **ID:** BC-07
- **Category:** Boundary conditions
- **Risk:** A consumer may assume that the 52-week range limit also guarantees at most 52 returned weekly summaries.
- **Input that exposes it:** A maximum-duration custom range whose inclusive `from` and `to` fall in partial endpoint weeks, causing the interval to intersect 53 Monday–Sunday buckets.
- **Current behavior observed in the code:** Bucket generation starts with the week containing `from` and ends with the week containing inclusive `to`, so a valid 364-local-day interval can produce 53 weekly summaries.
- **Recommended expected contract:** The 52-local-week limit constrains range duration, not the number of represented calendar-week buckets. Up to 53 weekly summaries are valid when partial endpoint weeks are included.
- **Contract status:** Confirmed
- **Why it matters:** Duration validation and chart-series cardinality are related but distinct concepts.

### BC-08 — Maximum-range endpoint time

- **ID:** BC-08
- **Category:** Boundary conditions
- **Risk:** Date-only range validation can accept nearly one additional day when `to` has a later local wall-clock time than `from`.
- **Input that exposes it:** `to` falls on the local date 364 days after `from`, but later in that local day than the `from` wall-clock time.
- **Current behavior observed in the code:** The range check includes local hour, minute, second, and millisecond values. An endpoint even one millisecond after the corresponding wall-clock time on the 364th local date is rejected.
- **Recommended expected contract:** The latest valid `to` is the same local wall-clock time 364 calendar days after `from` in the requested timezone. Timezone offset transitions do not alter that local-calendar limit.
- **Contract status:** Confirmed
- **Why it matters:** The stated maximum should have an exact, predictable endpoint rather than varying by the chosen times of day.

### BC-09 — Custom period ending in the future

- **ID:** BC-09
- **Category:** Boundary conditions
- **Risk:** Future empty buckets and present-time metadata can make a historical analytics response misleading.
- **Input that exposes it:** A custom range with `to > now`.
- **Current behavior observed in the code:** A custom `to` after the application boundary's current instant is rejected before the analytics query port is called.
- **Recommended expected contract:** Custom analytics ranges must not end after the application boundary's current instant. A future `to` returns a validation error before querying persistence.
- **Contract status:** Confirmed
- **Why it matters:** Analytics describes completed historical activity and should not imply that future empty periods are observed results.

### BC-10 — Nonexistent local midnight or calendar date

- **ID:** BC-10
- **Category:** Boundary conditions
- **Risk:** Historical timezone transitions can make a requested local midnight, or occasionally an entire local date, nonexistent and produce an incorrect boundary instant.
- **Input that exposes it:** A weekly boundary crossing an IANA transition that advances clocks at midnight or skips a local calendar date.
- **Current behavior observed in the code:** Local-wall-clock conversion verifies the corrected candidate. When midnight or the requested date does not exist, a bounded search returns the earliest instant on that date or the first valid instant after a skipped date.
- **Recommended expected contract:** Use the earliest valid instant on the requested local date. If the entire date is skipped, use the first valid instant after it while preserving deterministic calendar labels.
- **Contract status:** Confirmed
- **Why it matters:** Rare historical transitions should not silently assign sessions to the wrong period or create unstable week boundaries.

## Equivalence classes

### EC-01 — Workout-session lifecycle status

- **ID:** EC-01
- **Category:** Equivalence classes
- **Risk:** In-progress or cancelled attempts could inflate completed training.
- **Input that exposes it:** Otherwise identical `COMPLETED`, `IN_PROGRESS`, and `CANCELLED` sessions.
- **Current behavior observed in the code:** The Prisma adapter selects only sessions with status `COMPLETED`.
- **Recommended expected contract:** Only completed sessions contribute to analytics.
- **Contract status:** Confirmed
- **Why it matters:** Attempted or abandoned sessions are not completed training.

### EC-02 — Working sets versus warm-up sets

- **ID:** EC-02
- **Category:** Equivalence classes
- **Risk:** Warm-ups could inflate working-set, repetition, and volume metrics.
- **Input that exposes it:** Two otherwise identical sets where one has `isWarmup: false` and the other `isWarmup: true`.
- **Current behavior observed in the code:** Warm-ups increment only `warmupSets`; they return before working-set, repetition, and volume calculations.
- **Recommended expected contract:** Warm-ups are reported separately and excluded from working-set, repetition, and volume totals.
- **Contract status:** Confirmed
- **Why it matters:** This distinction is explicitly part of the first analytics release.

### EC-03 — Positive, zero, and unavailable external load

- **ID:** EC-03
- **Category:** Equivalence classes
- **Risk:** Unloaded work could be presented as measured external-load volume.
- **Input that exposes it:** Working sets with positive load, `"0.00"` load, and a conceptual missing load.
- **Current behavior observed in the code:** Positive load with positive repetitions is included; zero load is excluded. Negative or malformed persisted load fails the complete request with `AnalyticsQueryError`. The current schema cannot represent a null load.
- **Recommended expected contract:** Only working sets with positive load and repetitions contribute to volume. Zero or unavailable load remains visible in counts but is excluded from volume. A negative persisted load violates the workout-session non-negative-load invariant and fails the complete analytics request as malformed persisted data through the generic `500` path.
- **Contract status:** Confirmed
- **Why it matters:** Zero volume and unavailable volume convey different information.

### EC-04 — Multiple workouts on the same local day

- **ID:** EC-04
- **Category:** Equivalence classes
- **Risk:** Training-day totals could incorrectly equal workout totals.
- **Input that exposes it:** Two completed sessions on the same local calendar date.
- **Current behavior observed in the code:** Both sessions increment `completedWorkouts`, while a `Set` of local date keys produces one training day.
- **Recommended expected contract:** Count every completed workout, but count each local calendar date only once as a training day.
- **Contract status:** Confirmed
- **Why it matters:** Workout frequency and training-day consistency are distinct metrics.

### EC-05 — Repeated exercise within one workout

- **ID:** EC-05
- **Category:** Equivalence classes
- **Risk:** Splitting one exercise across multiple performance records could inflate workout frequency.
- **Input that exposes it:** Two performance records with the same `exerciseId` in one completed session, including records with conflicting exercise-name snapshots.
- **Current behavior observed in the code:** Sets and repetitions are combined, while a set of session IDs ensures `completedWorkoutCount` increases only once. Every performance is validated before contribution filtering, and conflicting same-session snapshots fail the complete request.
- **Recommended expected contract:** Exercise metrics group by stable exercise ID and count a workout at most once for that exercise. Repeated records for the same exercise within one session must carry the same exercise-name snapshot. Conflicting snapshots are malformed persisted data and fail the complete request through the generic `500` path; performance order does not select a winner.
- **Contract status:** Confirmed
- **Why it matters:** Frequency should mean workouts containing the exercise, not database-row count.

### EC-06 — Exercise renamed between workouts

- **ID:** EC-06
- **Category:** Equivalence classes
- **Risk:** Historical exercise activity could be fragmented by display-name changes or show a stale name.
- **Input that exposes it:** Several performances with the same `exerciseId` but different name snapshots.
- **Current behavior observed in the code:** Records are sorted by `startedAt`, and later snapshots replace earlier names while all metrics remain grouped by ID.
- **Recommended expected contract:** Group by stable exercise ID and display the most recent historical name snapshot in the selected period.
- **Contract status:** Confirmed
- **Why it matters:** This preserves identity while keeping the displayed historical name current for the period.

### EC-07 — Equal timestamps with conflicting exercise snapshots

- **ID:** EC-07
- **Category:** Equivalence classes
- **Risk:** The selected display name may depend on UUID ordering rather than a meaningful chronology.
- **Input that exposes it:** Two sessions with equal `startedAt`, the same exercise ID, and different name snapshots.
- **Current behavior observed in the code:** Sessions are ordered by `startedAt`, then `createdAt`, then session ID, so the most recently created equal-start session supplies the snapshot.
- **Recommended expected contract:** When sessions have the same `startedAt`, use the snapshot from the most recently created session. Use session ID ascending order only as the final deterministic tie-breaker when creation timestamps are also equal.
- **Contract status:** Confirmed
- **Why it matters:** UUID ordering has no user-visible temporal meaning.

### EC-08 — Standalone, routine, and program-origin sessions

- **ID:** EC-08
- **Category:** Equivalence classes
- **Risk:** One valid source type could be omitted or program skips could be counted as workouts.
- **Input that exposes it:** Completed standalone, routine-origin, and program-origin sessions, plus a skipped program occurrence.
- **Current behavior observed in the code:** Analytics does not filter by source type. Every completed session is eligible, while a skip without a completed workout-session row contributes nothing.
- **Recommended expected contract:** All completed workout sources are treated equally; program skips never count as workouts.
- **Contract status:** Confirmed
- **Why it matters:** Source provenance should not alter the meaning of completed training.

### EC-09 — Started date versus completion date

- **ID:** EC-09
- **Category:** Equivalence classes
- **Risk:** A workout spanning midnight could appear on an unexpected day.
- **Input that exposes it:** A completed workout starting before midnight and completing after midnight.
- **Current behavior observed in the code:** Filtering and bucketing use `startedAt`. `completedAt` and `cancelledAt` are selected only to validate persisted lifecycle consistency.
- **Recommended expected contract:** The local date of `startedAt` determines the training day and week.
- **Contract status:** Confirmed
- **Why it matters:** The approved contract explicitly selects one timestamp as the period authority.

### EC-10 — Meaning of an active week

- **ID:** EC-10
- **Category:** Equivalence classes
- **Risk:** `activeWeeks` may use a different denominator or partial-week policy than consumers expect.
- **Input that exposes it:** Activity only in a partial first, last, or current week.
- **Current behavior observed in the code:** Any generated bucket containing at least one completed workout is considered active, including partial weeks.
- **Recommended expected contract:** Any represented week with at least one completed workout is an active week, including partial first, last, and current weeks.
- **Contract status:** Confirmed
- **Why it matters:** Including partial weeks keeps `activeWeeks` focused on observed activity, while `completeWeeks` separately controls the average denominator.

### EC-11 — Equivalent IANA timezone identifiers

- **ID:** EC-11
- **Category:** Equivalence classes
- **Risk:** Alias identifiers for the same timezone can create duplicate formatter-cache entries or cause response metadata to depend on runtime canonical spelling.
- **Input that exposes it:** Equivalent valid identifiers such as `US/Eastern` and `America/New_York`, or an identifier surrounded by whitespace.
- **Current behavior observed in the code:** The timezone is trimmed before validation and its caller-provided spelling is retained in the resolved query. Formatter instances are cached by the runtime-resolved canonical timezone so equivalent aliases share the same formatter.
- **Recommended expected contract:** Trim the timezone before validation and preserve that valid trimmed identifier in response metadata. Use the runtime-resolved canonical timezone identifier only for internal formatter-cache identity so aliases share cached behavior without rewriting the public value.
- **Contract status:** Confirmed
- **Why it matters:** Public metadata remains faithful to valid caller input while equivalent zones behave consistently and avoid redundant cache entries.

### EC-12 — Exercise-name collation across runtimes

- **ID:** EC-12
- **Category:** Equivalence classes
- **Risk:** Case, accents, punctuation, or numeric text can sort differently under different runtime locales.
- **Input that exposes it:** Exercise names whose relative order differs between locale-aware collation and Unicode code-point comparison.
- **Current behavior observed in the code:** Exercise summaries use locale-independent Unicode code-point comparison, followed by exercise ID as a deterministic tie-breaker.
- **Recommended expected contract:** Exercise display names are ordered by locale-independent Unicode code-point order, followed by exercise ID ascending as the deterministic tie-breaker.
- **Contract status:** Confirmed
- **Why it matters:** The API should return the same ordering across development, CI, and production environments.

### EC-13 — Custom date query representations

- **ID:** EC-13
- **Category:** Equivalence classes
- **Risk:** Date-only or timezone-less strings can be interpreted differently across runtimes or independently of the requested analytics timezone.
- **Input that exposes it:** `from` or `to` supplied as `2026-01-01`, a local date-time without an offset, or another JavaScript-parseable non-RFC-3339 representation.
- **Current behavior observed in the code:** The DTO requires an RFC 3339 date-time with `Z` or an explicit numeric offset before converting it to a valid `Date`.
- **Recommended expected contract:** Custom `from` and `to` query values must be RFC 3339 date-times containing `Z` or an explicit numeric UTC offset. Date-only and timezone-less values are rejected.
- **Contract status:** Confirmed
- **Why it matters:** Each boundary must identify one unambiguous instant before local-calendar analytics rules are applied.

## Null or empty values

### NE-01 — Missing, blank, or invalid timezone

- **ID:** NE-01
- **Category:** Null or empty values
- **Risk:** Analytics could silently use the server timezone or generate invalid calendar boundaries.
- **Input that exposes it:** Missing `timezone`, `timezone=""`, whitespace-only input, or an unrecognized timezone.
- **Current behavior observed in the code:** DTO validation rejects missing and non-string values. The application trims before validating and consistently uses the valid trimmed identifier in the query and response.
- **Recommended expected contract:** A valid, nonblank IANA timezone is mandatory; no implicit server-timezone fallback is allowed. Leading and trailing whitespace is trimmed before validation, querying, formatter-cache lookup, and response construction, and the resolved response exposes the trimmed IANA identifier.
- **Contract status:** Confirmed
- **Why it matters:** Training days and weekly boundaries cannot be reproduced without an explicit timezone.

### NE-02 — Only one custom boundary supplied

- **ID:** NE-02
- **Category:** Null or empty values
- **Risk:** A partially supplied custom range may resolve differently from what the caller expects.
- **Input that exposes it:** `from` without `to`, or `to` without `from`.
- **Current behavior observed in the code:** The application requires `from` and `to` to be supplied together. Omitting both resolves the default period.
- **Recommended expected contract:** Custom `from` and `to` values must be supplied together. Omitting both selects the default four-local-week period; supplying only one boundary returns a validation error.
- **Contract status:** Confirmed
- **Why it matters:** An older custom `to` can unexpectedly create an invalid range rather than an eight-week period ending at that date.

### NE-03 — No completed sessions

- **ID:** NE-03
- **Category:** Null or empty values
- **Risk:** Empty history could be represented as zero volume, incorrectly implying a measured result.
- **Input that exposes it:** No eligible completed sessions in the selected period.
- **Current behavior observed in the code:** Count metrics are zero, exercise summaries are empty, weekly zero buckets are returned, and volume is `null` with `UNAVAILABLE` completeness.
- **Recommended expected contract:** Return a stable empty overview with zero factual counts and unavailable—not zero—volume.
- **Contract status:** Confirmed
- **Why it matters:** Consumers need an honest empty state without treating missing evidence as measured zero volume.

### NE-04 — Completed workout containing only warm-ups

- **ID:** NE-04
- **Category:** Null or empty values
- **Risk:** Warm-up-only history could be reported as completed working volume.
- **Input that exposes it:** A completed session whose only sets have `isWarmup: true`.
- **Current behavior observed in the code:** The workout and warm-up counts increase; working sets and repetitions remain zero; volume is `null` and `UNAVAILABLE`.
- **Recommended expected contract:** Count the completed workout and its warm-ups, but report no working-set volume.
- **Contract status:** Confirmed
- **Why it matters:** Warm-up facts remain visible without overstating training volume.

### NE-05 — Exercise performance with no completed sets

- **ID:** NE-05
- **Category:** Null or empty values
- **Risk:** Exercise frequency may claim an exercise occurred even though no set was recorded for it.
- **Input that exposes it:** A completed session containing an exercise-performance row with an empty `completedSets` array.
- **Current behavior observed in the code:** Performances with no completed sets are skipped. A performance containing only completed warm-up sets remains represented in exercise frequency.
- **Recommended expected contract:** An exercise contributes to exercise-frequency results only when its performance contains at least one completed set. A completed warm-up set is sufficient for exercise presence, although it remains excluded from working-set, repetition, and volume totals.
- **Contract status:** Confirmed
- **Why it matters:** A planned exercise that was never performed must not inflate exercise-frequency results.

### NE-06 — Null persisted load

- **ID:** NE-06
- **Category:** Null or empty values
- **Risk:** The documented missing-load state is not directly representable by the current persistence and application models.
- **Input that exposes it:** A completed working set with `loadKg: null`.
- **Current behavior observed in the code:** `loadKg` is non-nullable in Prisma and a required string in the analytics source model. The implemented equivalent for unloaded work is `"0.00"`.
- **Recommended expected contract:** Load remains required in this release. `0.00` represents no positive external load and is excluded from volume; null or missing load is unsupported.
- **Contract status:** Confirmed
- **Why it matters:** Keeping load mandatory gives the MVP one unambiguous representation for work without positive external load.

### NE-07 — Invalid application-layer date objects

- **ID:** NE-07
- **Category:** Null or empty values
- **Risk:** An internal caller that bypasses DTO validation could send an invalid date into calendar calculations or the persistence query.
- **Input that exposes it:** An invalid `Date` instance for `from`, `to`, or the injected `now` value, or a non-`Date` value passed through an untyped runtime boundary.
- **Current behavior observed in the code:** `resolveAnalyticsOverviewQuery` validates `now` and each supplied custom boundary before resolving the period or querying the analytics port.
- **Recommended expected contract:** The analytics application boundary validates `from`, `to`, and `now` as valid `Date` instances. Invalid values throw `AnalyticsValidationError` before the analytics query port is called; presentation-layer DTO validation is not the sole enforcement point.
- **Contract status:** Confirmed
- **Why it matters:** Application use cases may be invoked outside HTTP presentation, and malformed dates must fail predictably before infrastructure receives them.

### NE-08 — Missing or invalid source-session creation timestamp

- **ID:** NE-08
- **Category:** Null or empty values
- **Risk:** Equal-start snapshot selection can fall back to input order or an arbitrary epoch value when creation chronology is unavailable.
- **Input that exposes it:** A completed analytics source session with an absent or invalid `createdAt` value.
- **Current behavior observed in the code:** The source model requires `createdAt`, Prisma selects it explicitly, and the calculator rejects missing or invalid values before accepting the source session.
- **Recommended expected contract:** Every analytics source session must contain a valid `createdAt` timestamp. Missing or invalid values are malformed persisted data and fail the complete request through the generic `500` path.
- **Contract status:** Confirmed
- **Why it matters:** Equal-start session snapshots require reliable creation chronology, and application behavior should not depend solely on one adapter's schema guarantees.

### NE-09 — Completed source session without completed sets

- **ID:** NE-09
- **Category:** Null or empty values
- **Risk:** Analytics can count a persisted completed workout that violates the workout-session completion invariant.
- **Input that exposes it:** A source session marked `COMPLETED` whose performances collectively contain no completed sets.
- **Current behavior observed in the code:** The calculator rejects a completed source session that contains no completed sets.
- **Recommended expected contract:** A completed source session must contain at least one completed set. A zero-set completed session is malformed persisted data and fails the complete request through the generic `500` path.
- **Contract status:** Confirmed
- **Why it matters:** Analytics should not legitimize persisted state that the workout-session domain forbids.

## Business contract violations

### BV-01 — Cross-user analytics isolation

- **ID:** BV-01
- **Category:** Business contract violations
- **Risk:** One user could see another user’s workout history and derived metrics.
- **Input that exposes it:** Authenticated user A requests analytics while user B has eligible sessions in the same range.
- **Current behavior observed in the code:** The controller obtains `ownerId` from the authenticated principal, and the Prisma query includes `ownerId: query.ownerId`.
- **Recommended expected contract:** Analytics includes only records owned by the authenticated principal and never accepts a caller-selected user ID.
- **Contract status:** Confirmed
- **Why it matters:** Workout history is private user data.

### BV-02 — Future periods treated as completed weeks

- **ID:** BV-02
- **Category:** Business contract violations
- **Risk:** A current or future week can enter the complete-week denominator before it has elapsed, lowering the average.
- **Input that exposes it:** A custom `to` at or beyond the end of the current week, especially one extending into future weeks.
- **Current behavior observed in the code:** Future custom bounds are rejected. Complete-week filtering requires the full bucket to be represented and to have ended by `now`.
- **Recommended expected contract:** The current week and future weeks do not count as complete before they have elapsed. Custom requests with `to > now` are rejected as specified by BC-09.
- **Contract status:** Confirmed
- **Why it matters:** The approved contract excludes the partial current week from complete-week averages.

### BV-03 — Average-workout rounding policy

- **ID:** BV-03
- **Category:** Business contract violations
- **Risk:** Consumers may reproduce the same average with different precision or rounding.
- **Input that exposes it:** Two completed workouts across three complete weeks.
- **Current behavior observed in the code:** `averageWorkoutsPerCompleteWeek` is rounded to two decimal places using JavaScript `toFixed`.
- **Recommended expected contract:** `averageWorkoutsPerCompleteWeek` is returned as a JSON number rounded half-up to at most two decimal places.
- **Contract status:** Confirmed
- **Why it matters:** A fixed precision and rounding rule keeps the metric reproducible across backend and frontend consumers.

### BV-04 — Runtime response and documented schema drift

- **ID:** BV-04
- **Category:** Business contract violations
- **Risk:** Generated API clients or frontend developers may not see all fields that exist at runtime.
- **Input that exposes it:** Inspecting the OpenAPI schema or approved response example for the overview endpoint.
- **Current behavior observed in the code:** Runtime, TypeScript, and Swagger response contracts explicitly describe `period`, `totals`, `activeWeeks`, `completeWeeks`, and `averageWorkoutsPerCompleteWeek`.
- **Recommended expected contract:** The response documentation and OpenAPI schema should explicitly include all three approved weekly aggregate fields.
- **Contract status:** Confirmed
- **Why it matters:** These metrics are approved in the prose contract and implemented, but the machine-readable/public shape is incomplete.

### BV-05 — Invalid persisted data reported as a client error

- **ID:** BV-05
- **Category:** Business contract violations
- **Risk:** A storage-integrity problem could be presented as an invalid client query.
- **Input that exposes it:** An analytics source set with a load string that cannot be parsed by `parseLoadCents`, a negative persisted load, or repeated same-session records for one exercise with conflicting name snapshots.
- **Current behavior observed in the code:** Unparseable or negative load data and conflicting same-session snapshots produce an internal analytics query error and fail the complete request.
- **Recommended expected contract:** Malformed persisted analytics facts fail the entire request with a generic `500` internal data/query error. This includes unparseable or negative loads and conflicting name snapshots for the same exercise within one session. They must not produce a `400` response, be silently omitted, or be resolved through arbitrary ordering.
- **Contract status:** Confirmed
- **Why it matters:** The caller cannot correct persisted data through analytics query parameters. The current Prisma decimal schema makes this uncommon, so the immediate risk is low.

### BV-06 — Query and database failures

- **ID:** BV-06
- **Category:** Business contract violations
- **Risk:** Database details could leak, or infrastructure failures could be mistaken for empty analytics.
- **Input that exposes it:** Prisma connection, query, or mapping failure.
- **Current behavior observed in the code:** The adapter converts failures to `AnalyticsQueryError`; presentation returns a generic `500` response.
- **Recommended expected contract:** Infrastructure failures return a generic server error and must never be converted into a successful empty overview.
- **Contract status:** Confirmed
- **Why it matters:** “No training data” and “analytics could not be calculated” require different user-facing handling.

### BV-07 — Calculator dependence on perfectly filtered adapter input

- **ID:** BV-07
- **Category:** Business contract violations
- **Risk:** A future query-port implementation could pass out-of-range sessions that the calculator counts when they share an included weekly bucket.
- **Input that exposes it:** A calculator input session outside the exact range but inside the same Monday–Sunday bucket as an included boundary.
- **Current behavior observed in the code:** The calculator checks only whether the session’s weekly bucket exists. The current Prisma adapter performs exact range filtering beforehand.
- **Recommended expected contract:** The analytics query port owns owner, completed-status, and exact inclusive date-range filtering. The calculator operates on trusted, normalized source sessions and does not repeat those eligibility checks.
- **Contract status:** Confirmed
- **Why it matters:** The current integrated path is correct, but the application calculation is not independently safe against a different adapter or fixture source.

### BV-08 — Unbounded source-row volume within 52 weeks

- **ID:** BV-08
- **Category:** Business contract violations
- **Risk:** A user with unusually dense history could cause high memory use or response latency.
- **Input that exposes it:** A maximum-range request containing a very large number of sessions, performances, and sets.
- **Current behavior observed in the code:** Prisma loads every selected row and nested set into memory, after which the application performs sorting and aggregation.
- **Recommended expected contract:** The MVP processes all valid history within the 52-local-week range without a session or set row-count cap. Query optimization or materialization requires measured performance evidence.
- **Contract status:** Confirmed
- **Why it matters:** The date bound limits time but does not directly limit row count. This is an operational risk rather than an established functional defect.

### BV-09 — Undocumented exercise-summary ordering

- **ID:** BV-09
- **Category:** Business contract violations
- **Risk:** Consumers may accidentally depend on ordering that later changes.
- **Input that exposes it:** Several exercise summaries with different current snapshot names.
- **Current behavior observed in the code:** Results are sorted by the selected exercise-name snapshot and then by exercise ID.
- **Recommended expected contract:** Exercise summaries are ordered by display name ascending and then by exercise ID ascending as the deterministic tie-breaker.
- **Contract status:** Confirmed
- **Why it matters:** Contractual ordering gives clients stable, reproducible output without requiring independent sorting rules.

### BV-10 — Weekly summaries inconsistent with period totals

- **ID:** BV-10
- **Category:** Business contract violations
- **Risk:** Period totals could report completed work while the corresponding weekly summaries report zero or different set, repetition, warm-up, or volume values.
- **Input that exposes it:** A completed session containing warm-up and working sets within a represented week.
- **Current behavior observed in the code:** Each eligible performance is aggregated into both period totals and its assigned weekly bucket.
- **Recommended expected contract:** Every exposed `WeeklyTrainingSummary` metric is calculated from eligible sessions assigned to that local week using the same set, repetition, volume, and completeness rules as period totals. Across the represented period, weekly factual counts and volume reconcile with their corresponding period totals.
- **Contract status:** Confirmed
- **Why it matters:** Consumers must be able to move between overview totals and weekly detail without contradictory analytics.

### BV-11 — Persisted repetition outside domain bounds

- **ID:** BV-11
- **Category:** Business contract violations
- **Risk:** Negative, fractional, or excessively large repetition values can corrupt count and volume metrics.
- **Input that exposes it:** A persisted completed set whose repetitions are not an integer from `0` through `1000`, inclusive.
- **Current behavior observed in the code:** The calculator requires integer repetitions in `0..1000` before using them in counts or volume calculations.
- **Recommended expected contract:** Persisted repetitions must be integers in the inclusive range `0..1000`. Values outside that range are malformed persisted data and fail the complete request through the generic `500` path.
- **Contract status:** Confirmed
- **Why it matters:** Analytics must preserve the workout-session repetition invariant and avoid publishing corrupted totals.

### BV-12 — Invalid exercise-name snapshot

- **ID:** BV-12
- **Category:** Business contract violations
- **Risk:** Blank, untrimmed, or out-of-range snapshots can produce unstable grouping displays and ordering.
- **Input that exposes it:** A persisted exercise-name snapshot containing surrounding whitespace, fewer than 2 characters after trimming, or more than 150 characters.
- **Current behavior observed in the code:** Every persisted performance snapshot, including non-contributing empty performances, must already be trimmed and contain 2–150 characters.
- **Recommended expected contract:** Exercise-name snapshots must already be trimmed and contain between 2 and 150 characters, inclusive. Violations are malformed persisted data and fail the complete request through the generic `500` path.
- **Contract status:** Confirmed
- **Why it matters:** Analytics should not normalize or publish persisted names that violate the originating domain invariant.

### BV-13 — Completed-session lifecycle timestamp inconsistency

- **ID:** BV-13
- **Category:** Business contract violations
- **Risk:** A row marked completed can carry contradictory lifecycle history that analytics silently treats as valid.
- **Input that exposes it:** A `COMPLETED` source session without `completedAt`, or one that also contains `cancelledAt`.
- **Current behavior observed in the code:** The adapter selects `completedAt` and `cancelledAt`, and the calculator requires a completion timestamp and rejects any completed source session carrying a cancellation timestamp.
- **Recommended expected contract:** A completed analytics source session must contain `completedAt` and must not contain `cancelledAt`. Contradictions are malformed persisted data and fail the complete request through the generic `500` path.
- **Contract status:** Confirmed
- **Why it matters:** Status filtering alone should not legitimize internally contradictory historical state.

### BV-14 — Corrections and deletions changing historical analytics

- **ID:** BV-14
- **Category:** Business contract violations
- **Risk:** Consumers may assume a previously viewed analytics result is an immutable historical record.
- **Input that exposes it:** An authorized correction or deletion of a workout-session fact followed by the same analytics request.
- **Current behavior observed in the code:** Analytics is calculated on demand from current persisted workout-session data, so changes to canonical history affect subsequent results.
- **Recommended expected contract:** Analytics is a live projection of current canonical workout history. Authorized corrections and deletions are reflected in past-period results; immutable or versioned reporting is outside this release.
- **Contract status:** Confirmed
- **Why it matters:** Consumers need to know whether analytics represents current truth or a frozen report when reconciling changed historical values.
