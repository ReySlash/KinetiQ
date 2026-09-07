# Analytics Mutation Report Analysis

This report records the current analytics mutation run against the confirmed contracts in `failure-mode-catalog.md`. It intentionally replaces the earlier historical baseline.

## Run configuration

- **Command:** `pnpm --filter api test:mutation:analytics`
- **Configuration:** `apps/api/stryker.analytics.config.mjs`
- **Mutation scope:** analytics production TypeScript files, excluding specs and test doubles
- **Tests discovered:** 87
- **Report artifacts:** `apps/api/reports/mutation/analytics-mutation.json` and `analytics-mutation.html`

## Measured result

| Outcome       | Count |
| ------------- | ----: |
| Killed        |   317 |
| Timed out     |    17 |
| Survived      |   101 |
| No coverage   |     7 |
| Compile error |   144 |
| Total         |   586 |

- **Mutation score:** 75.57%
- **Covered mutation score:** 76.78%

Timeouts are detected behavioral changes and contribute to the mutation score. Compile-error mutants are not executable survivors; the TypeScript checker rejected their generated programs.

## Surviving-mutant classification

### Actionable — 48

These survivors can alter behavior confirmed by the failure-mode catalog. They identify focused test gaps; they do not, by themselves, prove that the current production implementation is incorrect.

| Area | Mutants | Confirmed contracts | Why actionable |
| ---- | ------- | ------------------- | -------------- |
| Civil-time arithmetic and verified boundary resolution | `#30`, `#44`, `#59`–`#61`, `#84`, `#93`–`#107`, `#112`, `#134`, `#135` | BC-03, BC-04, BC-06, BC-08, BC-10, EC-11 | These mutations can alter calendar parts, candidate verification, search bounds, or binary-search selection. |
| Partial-current-week metadata | `#245` | BC-02, BC-03 | Removing the lower overlap check can mark an entirely historical range as current. |
| Average rounding | `#349` | BV-03 | Returning the unrounded value can violate the approved two-decimal result. |
| Persisted lifecycle integrity | `#390`, `#391`, `#393` | BV-13 | These weaken the requirement for `completedAt` and prohibition of `cancelledAt`. |
| Deterministic code-point ordering | `#461`, `#463`, `#464`, `#467` | EC-12, BV-09 | These can reverse or bypass the required comparison and ID tie-breaker. |
| RFC 3339 query syntax and absent-boundary transformation | `#564`, `#565`, `#578`, `#581`–`#585`, `#588`, `#590`–`#592`, `#594`, `#596`, `#598` | EC-13, NE-02 | These accept malformed offset syntax or change handling of omitted optional boundaries. |

### Equivalent — 28

These mutations leave confirmed observable behavior unchanged and should not drive tests.

| Area | Mutants | Why equivalent |
| ---- | ------- | -------------- |
| Canonical formatter cache writes | `#34`, `#35`, `#37` | They change allocation or reuse, not the returned analytics result. |
| Corrected-candidate fast path | `#76`–`#78`, `#80`–`#82`, `#108`, `#114` | The verified fallback resolves the same boundary when the optimization is bypassed or produces an invalid candidate. |
| Logically redundant current-week checks | `#239`, `#240`, `#246` | Other validated range constraints make the mutated boundary states unreachable. |
| Unreachable negative-volume formatting | `#472`, `#473`, `#478`, `#479` | Valid aggregation cannot produce negative volume. |
| Blank-timezone branch variants | `#489`–`#491` | The same invalid input still becomes `AnalyticsValidationError`; exact message text is not contractual. |
| Prisma and nested-row ordering | `#519`, `#520`, `#522`, `#533`, `#538`, `#539` | The calculator establishes session order, and set aggregation is commutative. |
| Generic internal-error branch | `#555` | Both paths remain a generic non-leaking `500`, as required by BV-05 and BV-06. |

### Non-actionable — 25

These survivors mutate text or metadata that the confirmed contracts intentionally do not make stable.

- Early-year date-key padding outside the product scope: `#69`, `#71`.
- Validation/query error copy: `#191`, `#195`, `#199`, `#205`, `#215`, `#224`, `#233`, `#363`, `#381`, `#388`, `#409`, `#427`, `#437`, `#454`, `#493`, `#498`, `#506`, `#559`.
- Internal error `code`, `name`, and default-message metadata: `#507`–`#511`.

## No-coverage classification

| Classification | Mutants | Reason |
| -------------- | ------- | ------ |
| Actionable | `#137`, `#395`, `#563` | They remove binary-search progression, lifecycle-integrity rejection, or controller error translation required by BC-10, BV-13, and the HTTP error contract. |
| Equivalent | `#475` | It affects an unreachable negative aggregate-volume formatting branch. |
| Non-actionable | `#57`, `#124`, `#397` | They mutate defensive or internal error messages whose exact text is not contractual. |

## Timed-out mutants

The following 17 mutants were detected by timeout and are not unresolved survivors:

`#0`, `#1`, `#2`, `#6`, `#7`, `#22`, `#24`, `#63`, `#67`, `#79`, `#116`, `#127`, `#129`, `#132`, `#138`, `#139`, `#256`.

## Current conclusion

The production changes now cover the confirmed BC-08, BC-10, EC-05, EC-11, BV-04, BV-12, and BV-13 implementation gaps identified before this run. The targeted contract suite is green.

The next mutation-focused iteration should prioritize the 51 actionable undetected outcomes: 48 survivors plus 3 no-coverage mutants. Equivalent and non-actionable mutants above should not be pursued merely to increase the score.
