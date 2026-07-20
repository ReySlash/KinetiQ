# Recovery and fatigue tracking

## Purpose and status

Capture an athlete’s subjective context separately from editorial exercise demand and observed performance. This post-MVP feature may help explain readiness and trends, but it must not diagnose health or turn a few ratings into a precise fatigue score.

## First proposed slice

Offer an optional daily or pre-session check-in with sleep quality, general energy, muscle soreness, motivation, perceived stress, and free-text notes. Prefer a few clearly labeled ordinal responses over many pseudo-precise biomarkers. Users can skip any optional item and see their own history.

## Out of scope

Medical symptoms/diagnosis, injury risk, hormonal/CNS claims, automatic training cancellation, wearable integration, coach monitoring, and machine-learned readiness scores.

## Suggested model

```text
RecoveryCheckIn(
  id, ownerId, localDate, timezone,
  sleepQuality?, energy?, motivation?, perceivedStress?,
  generalSoreness?, notes?, createdAt, updatedAt
)
MuscleSorenessEntry(checkInId, muscleId, score) # defer until users need regional detail
```

Use a dedicated check-in scale with its own meaning, not automatically the exercise 0–5 editorial scale. Recommendation: five labeled responses stored as integers 1–5, with direction explicit per question so “5” never ambiguously means both high stress and high readiness. Unique `(ownerId, localDate)` if only one daily check-in is allowed; pre-session check-ins instead attach to a session and need a different uniqueness rule.

## Domain rules

- Athlete observations never modify global `ExerciseDemandProfile`.
- Actual response is interpreted with prescription/performance, recent training, and context; exercise demand alone is insufficient.
- Missing answers remain null and are never converted to neutral values.
- Free-text length is bounded, private, escaped, excluded from ordinary logs/telemetry, and covered by deletion/export policy.
- Any derived readiness/fatigue estimate identifies input completeness, method version, limitations, and never presents medical certainty.
- Recommendations are opt-in, explainable, dismissible, and do not automatically rewrite plans.

## API and frontend

Owned CRUD may use `POST/GET/PATCH /api/v1/recovery-check-ins` with date-range bounds. UI includes a quick mobile check-in, history calendar/list, question definitions, optionality/privacy text, and an “insufficient data” state. Charts must not imply causation between a score and performance.

## Authorization and privacy

All queries constrain owner ID. Treat notes and check-ins as sensitive user data with strict log/analytics exclusion. Before coach sharing, require explicit per-athlete grant, visible access, revocation, and audit. Define export/deletion and retention before launch.

## Testing requirements

Test scale direction/labels, null versus neutral, timezone/local-date uniqueness, owner isolation, range bounds, escaped notes, log redaction, data export/deletion, derived-estimate sufficiency/version, and accessible mobile forms. Later regression tests ensure global demand-profile edits do not rewrite historical recovery interpretations without a calculation version change.

## Edge cases

Travel across dates/timezones, multiple sessions in a day, retroactive check-ins, missing questions, consistently extreme answers, edited/deleted sessions, and users interpreting guidance medically. Provide crisis/medical-help copy only if the product intentionally asks health-risk questions; recommendation is not to ask them in the first slice.

## Dependencies and sequence

Requires sessions, privacy lifecycle, and sufficient user research. Start with raw optional check-ins/history, then correlations with transparent source data, and only then small rules-based suggestions.

## Definition of done

Users control private, optional check-ins; scales are unambiguous; missing data stays missing; owner/privacy tests pass; any estimate is versioned and explainable; and no medical or deterministic fatigue claim is made.

## Open questions

Daily versus pre-session timing, exact questions/scales, retention/export, whether regional soreness adds value, data residency, and the evidence threshold for a recommendation must be resolved before implementation.

