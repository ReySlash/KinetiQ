# Exercise demand and fatigue profile

## Purpose and user problem

Describe the exercise’s typical technical, setup, loading, and recovery demands separately from what it can develop. This helps selection and later planning without claiming that an exercise inherently causes a fixed amount of fatigue.

## MVP scope

Include a one-to-one profile with the following 0–5 editorial ratings:

- `technicalDemand`
- `setupComplexity`
- `stabilityDemand`
- `systemicFatiguePotential`
- `localFatiguePotential`
- `recoveryCostPotential`
- `gripDemand`
- `axialLoadingPotential`

Defer `jointStressPotential`, `spinalCompressionPotential`, and `spinalShearPotential`. Those labels can imply clinical precision, depend heavily on technique/anatomy/load, and require stronger editorial definitions. Axial loading is useful but must also be presented as a broad relative classification.

## Out of scope

The profile does not estimate an athlete’s actual fatigue, recovery time, injury risk, CNS fatigue, joint safety, or session workload. It does not replace prescription and context.

## User stories

- A user can understand why an exercise may be technically demanding or costly to recover from.
- An administrator can apply a calibrated common scale.
- Future routine analysis can expose relative demand without pretending it is measured fatigue.
- The UI explicitly states that sets, intensity, volume, proximity to failure, experience, sleep, and health modify actual response.

## Suggested model

```prisma
model ExerciseDemandProfile {
  exerciseId                String   @id @db.Uuid
  technicalDemand           Int
  setupComplexity           Int
  stabilityDemand           Int
  systemicFatiguePotential  Int
  localFatiguePotential     Int
  recoveryCostPotential     Int
  gripDemand                Int
  axialLoadingPotential     Int
  editorialNotes            String?
  createdAt                  DateTime @default(now()) @db.Timestamptz(3)
  updatedAt                  DateTime @updatedAt @db.Timestamptz(3)
  exercise                   Exercise @relation(fields: [exerciseId], references: [id], onDelete: Cascade)
}
```

Use typed columns and PostgreSQL checks for each score. Do not name any field `cnsFatigue`; `systemicFatiguePotential` is the accepted vocabulary. Start without per-score indexes and add only for actual filter patterns.

## Definitions

- **Technical demand:** skill and precision normally required for repeatable execution.
- **Setup complexity:** equipment, positioning, assistance, and time needed before working sets.
- **Stability demand:** control required to maintain intended positions; not the potential to develop stability.
- **Systemic fatigue potential:** relative whole-body fatigue under a typical challenging prescription.
- **Local fatigue potential:** relative fatigue concentrated in involved muscles.
- **Recovery cost potential:** broad likelihood that a challenging exposure affects subsequent training readiness.
- **Grip demand:** extent to which grip limits or materially contributes.
- **Axial loading potential:** relative loading transmitted broadly along the body/spinal axis in typical use.

Each is scored relative to the curated exercise catalog, not against an absolute unit.

## Domain and validation rules

- Integers 0–5 inclusive; 0 means negligible/not applicable, never unknown.
- Published exercises require all MVP fields.
- Scores must be edited with their definitions and a “typical challenging prescription” caveat visible.
- A high demand does not mean an exercise is bad or unsafe. API property descriptions and UI copy must avoid moral/safety labels.
- Actual fatigue belongs to later session/recovery analysis and incorporates prescription plus athlete context.
- Profile changes are part of the exercise transaction.

## API and frontend

Embed `demands` in exercise create/update/detail. Use explicit filters such as `maxTechnicalDemand=2` or `maxSystemicFatiguePotential=2`; reject unknown operators. Return the score legend or a stable documentation link in UI metadata rather than duplicating definitions in every record.

The admin `DemandProfileSection` has eight labeled score controls and internal notes. Public details render a text-accessible comparison. Filter copy should say “editorial rating” and not “fatigue prediction.”

## Authorization

Public read; administrator-only mutation through the composed exercise service. Future athlete-specific overrides or observations must be a separate owned concept, never edits to the global profile.

## Testing requirements

- Validate every boundary, fractional/string inputs, missing required values, and unknown fields
- Verify database checks and one-to-one cascade behavior
- Prove transaction rollback on invalid demand data
- Test exact min/max filter semantics and combinations
- Test normal-user/anonymous mutation denial
- Test accessibility of labels/help/caveat and loading/error states
- Content review test/checklist ensures `cnsFatigue` does not appear in schemas or UI

## Edge cases

Movements whose demand changes sharply by equipment, technique, or load; exercises with negligible axial load; absent draft values; contradictory capability/demand scores; and future taxonomy changes. If one name hides materially different demand profiles, create separate exercise variants rather than storing broad min/max ranges in MVP.

## Dependencies and implementation sequence

Depends on exercise identity and score vocabulary. Implement after capabilities using the same form/constraint patterns, then add a limited set of useful filters and content calibration.

## Definition of done

All active exercises have constrained, defined profiles; no claim suggests actual personalized fatigue; database/API/UI semantics match; admin mutations are authorized and atomic; and deferred clinical-sounding fields are absent.

## Future extensions and open questions

Prescription-aware fatigue heuristics, athlete feedback, and joint-region demand might be added after sessions exist. Before spinal compression/shear or joint stress is introduced, define evidence, curator qualifications, user-facing purpose, and safety language. Whether users can hide these editorial ratings is a later UX question.

