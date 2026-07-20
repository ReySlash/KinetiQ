# Project vision

## Purpose

KinetiQ should help a person understand exercises, assemble sound workout templates, and eventually learn from performed training over months and years. It is a development system, not merely a list of workouts and not a medical diagnostic product.

## User problem

Exercise information, workout prescriptions, performance history, and recovery notes are often mixed together in spreadsheets or apps that cannot explain their recommendations. Users need a structured library and a routine workflow first; advanced insight is only credible after clean historical data exists.

## Product principles

- Separate reference facts, editorial classifications, prescriptions, performances, and athlete responses.
- Prefer transparent rules and visible source data over opaque “smart” scores.
- Ship narrow vertical slices that are useful on their own.
- Keep controlled taxonomies small. Do not build a comprehensive anatomy, biomechanics, or sport-science database in v1.
- Treat all 0–5 scores as ordered editorial comparisons. Display their definitions and never imply laboratory precision.
- Preserve history: editing today’s template must not alter what an athlete performed previously.
- Design for responsive and keyboard-accessible use from the start.
- Optimize for one developer: one repository, a modular monolith API, one PostgreSQL database, and few operational dependencies.

## Rating vocabulary

All comparative capability, involvement, demand, and athletic-quality scores use one integer scale:

| Score | Label | Meaning |
| --- | --- | --- |
| 0 | Not applicable / negligible | The characteristic is absent or not meaningful for normal performance. |
| 1 | Very low | Present only weakly under typical prescription and technique. |
| 2 | Low | Below the library’s typical exercise. |
| 3 | Moderate | Meaningful and comparable with an ordinary mid-range exercise. |
| 4 | High | A strong characteristic and likely relevant to selection. |
| 5 | Very high | Among the strongest examples in the curated library. |

Scores describe the exercise under a documented typical execution and prescription range. They do not predict an individual’s result. Every UI that edits or presents a score should make the scale accessible through labels or help text.

## Scope

The product starts with controlled muscles and exercises, detailed relationships, search, thumbnails, authentication, and personal routines. It later adds plans, sessions, analytics, recommendations, recovery, and coaching in that dependency order.

## Out of scope as product claims

- Diagnosis, rehabilitation prescriptions, or injury-risk prediction
- Guaranteed hypertrophy, strength, fatigue, or sport-performance outcomes
- Replacement for a qualified medical or coaching professional
- Automatic coaching based on insufficient data

## Success measures

For the MVP, success means a maintainer can curate consistent exercise data and a user can quickly find exercises and create, duplicate, reorder, edit, and delete private routines without data leakage. Operationally, a deploy must be repeatable and a database backup demonstrably restorable.

Later product measures include routine reuse, completed session consistency, data completeness, and whether users understand why a metric or recommendation was shown. Engagement alone is not a sufficient quality metric.

## Domain language

- **Exercise:** a stable movement definition, not a prescribed set and not a performance.
- **Muscle assignment:** an editorial relationship describing role and relative involvement.
- **Capability profile:** qualities an exercise can generally help develop.
- **Demand profile:** general technical, loading, fatigue, and recovery characteristics.
- **Routine:** a reusable ordered workout template.
- **Prescription:** targets attached to an exercise in a routine.
- **Session:** one historical workout occurrence.
- **Completed set:** an athlete’s recorded performance.
- **Derived metric:** a reproducible calculation from stored source data.
- **Heuristic:** an estimate with assumptions, limitations, and versioned logic.

## Definition of product integrity

The project retains integrity when source data is distinguishable from calculations, ownership is enforced at query boundaries, historical records are immutable except for explicit corrections, and every user-facing estimate can identify its input data and interpretation.

