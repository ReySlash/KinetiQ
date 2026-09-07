# Analytics Mutation Report Analysis

This report records the measured analytics mutation run against the confirmed
contracts in `failure-mode-catalog.md`. It replaces the previous historical
baseline.

## Run configuration

- **Command:** `pnpm --filter api test:mutation:analytics`
- **Configuration:** `apps/api/stryker.analytics.config.mjs`
- **Mutation scope:** analytics production TypeScript files, excluding specs
  and test doubles
- **Tests discovered:** 98
- **Production files instrumented:** 13
- **Report artifacts:** `apps/api/reports/mutation/analytics-mutation.json` and
  `analytics-mutation.html`

## Measured result

| Outcome | Count |
| --- | ---: |
| Killed | 362 |
| Timed out | 18 |
| Survived | 144 |
| No coverage | 12 |
| Compile error | 200 |
| Total generated mutants | 736 |

- **Mutation score:** 70.90%
- **Covered mutation score:** 72.52%

Timeouts are detected behavioral changes and contribute to the mutation score.
Compile-error mutants are not executable survivors; the TypeScript checker
rejected their generated programs. These figures are from the generated JSON
report, not an estimate.

## Survivor classification

The full measured survivor set is available in the generated JSON artifact. The
survivors fall into these review groups:

- **Contract-sensitive:** calendar search and boundary arithmetic; comparison
  period construction; persisted-set validation; maximum-load and last-set
  eligibility; stable exercise ordering; Prisma query selection/order; DTO
  RFC-3339 validation; and exception-translation branches. These are the areas
  where a survivor can change confirmed behavior and should be reviewed when
  the corresponding contract is extended.
- **Equivalent or implementation-detail:** formatter-cache details, defensive
  branches unreachable after validated inputs, nested Prisma ordering that is
  re-established by pure calculation, and internal control-flow alternatives
  that produce the same observable response.
- **Non-actionable:** exact internal error names, codes, default messages, and
  other text metadata not guaranteed by the HTTP contract.

The mutation run does not justify adding tests solely to increase the score.
Future work should target contract-sensitive survivors only, especially the
calendar resolver and persisted-data integrity paths. No production behavior
is changed solely to kill an equivalent or non-actionable mutant.

## Current conclusion

The strict future-date rule, four-week default, code-point exercise ordering,
decimal-safe load eligibility, recent-workout limit, last-working-set tie-break,
timezone boundary resolver, expanded response schema, and truthful unavailable
volume states are covered by the focused, full unit, E2E, and browser suites.
The remaining mutation survivors are documented as measured follow-up review
items rather than treated as evidence of an implementation defect.
