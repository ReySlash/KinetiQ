# Mutation Survivor Classification Report

This report classifies every surviving mutant from the adopted-training-programs
domain and application mutation-testing pilot. Classifications use
`failure-mode-catalog.md` as the source of truth for confirmed contracts.

| Mutant | Function / Symbol | Mutation | Potential Uncovered Behavior | Classification | Why | Next Test Iteration? |
| --- | --- | --- | --- | --- | --- | --- |
| #1 | `AdoptedTrainingProgramNotFoundError.constructor` | Replaces the error message with an empty string. | Exact not-found message stability. | Pending decision | EC-01 confirms concealed not-found behavior, but not exact English wording. | Pending decision |
| #2 | `AdoptedTrainingProgramNotFoundError.constructor` | Empties `Error.name`. | Diagnostic error-name preservation. | Non-actionable | `Error.name` is an implementation/diagnostic detail, not a documented contract. | No |
| #3 | `AdoptedTrainingProgramSourceNotFoundError.code` | Replaces the stable code with an empty string. | Source-not-found responses may lose their machine-readable code. | Resolved | A literal HTTP-body assertion now protects the BV-05 stable code contract; the incremental mutation rerun killed this mutant. | No |
| #4 | `AdoptedTrainingProgramSourceNotFoundError.constructor` | Empties the message. | Exact source-not-found wording. | Pending decision | Exact wording is not confirmed. | Pending decision |
| #5 | `AdoptedTrainingProgramSourceNotFoundError.constructor` | Empties `Error.name`. | Diagnostic error-name preservation. | Non-actionable | Not part of the observable business/API contract. | No |
| #7 | `AdoptedTrainingProgramSourceUnavailableError.constructor` | Empties the message. | Exact source-unavailable wording. | Pending decision | NE-04/BV-08 confirm behavior, not message text. | Pending decision |
| #8 | `AdoptedTrainingProgramSourceUnavailableError.constructor` | Empties `Error.name`. | Diagnostic error-name preservation. | Non-actionable | Implementation detail. | No |
| #10 | `AdoptedTrainingProgramEmptyScheduleError.constructor` | Empties the message. | Exact empty-schedule wording. | Pending decision | NE-01 confirms rejection and stable code, not wording. | Pending decision |
| #11 | `AdoptedTrainingProgramEmptyScheduleError.constructor` | Empties `Error.name`. | Diagnostic error-name preservation. | Non-actionable | Implementation detail. | No |
| #13 | `AdoptedTrainingProgramAlreadyNonTerminalError.constructor` | Empties the message. | Exact conflict wording. | Pending decision | No confirmed exact-message contract. | Pending decision |
| #14 | `AdoptedTrainingProgramAlreadyNonTerminalError.constructor` | Empties `Error.name`. | Diagnostic error-name preservation. | Non-actionable | Implementation detail. | No |
| #16 | `AdoptedTrainingProgramPersistenceError.constructor` | Empties the message. | Exact internal-error wording. | Pending decision | The catalog requires concealment and stable codes, but not exact wording. | Pending decision |
| #17 | `AdoptedTrainingProgramPersistenceError.constructor` | Empties `Error.name`. | Diagnostic error-name preservation. | Non-actionable | Implementation detail. | No |
| #19 | `AdoptedTrainingProgramQueryError.constructor` | Empties the message. | Exact query-error wording. | Pending decision | Exact wording is not confirmed. | Pending decision |
| #20 | `AdoptedTrainingProgramQueryError.constructor` | Empties `Error.name`. | Diagnostic error-name preservation. | Non-actionable | Implementation detail. | No |
| #22 | `AdoptedTrainingProgramConcurrencyError.constructor` | Empties the message. | Exact concurrency-conflict wording. | Pending decision | EC-01/EC-03 confirm conflict classification, not wording. | Pending decision |
| #23 | `AdoptedTrainingProgramConcurrencyError.constructor` | Empties `Error.name`. | Diagnostic error-name preservation. | Non-actionable | Implementation detail. | No |
| #97 | `AdoptedTrainingProgram.cancel` | Makes the “not PAUSED” operand always true. | Cancellation from a valid paused program becomes rejected. | Resolved | A behavioral test now confirms cancellation from a paused program with no active occurrence; the incremental mutation rerun killed this mutant. | No |
| #102 | `AdoptedTrainingProgram.cancel` | Empties the invalid-transition message. | Exact cancellation failure wording. | Pending decision | Exact lifecycle-message wording is not confirmed. | Pending decision |
| #107, #108, #110, #113, #114, #119, #121, #123, #126, #129, #134 | `AdoptedTrainingProgram.complete` | Mutations of the explicit parent-completion operation. | Explicit parent completion behavior. | Resolved | The explicit operation was removed by approved decision. Parent completion occurs only as part of resolving the final occurrence, as confirmed by BV-03. | No |
| #142 | `completeOccurrence` | Removes `assertCanResolveOccurrence()`. | Invalid parent states may reach child transition validation instead. | Non-actionable | Valid confirmed paths are unchanged; only defensive error provenance changes for invalid states. | No |
| #145 | `cancelOccurrence` | Removes `assertCanResolveOccurrence()`. | Invalid parent states may reach child transition validation instead. | Non-actionable | Valid aggregate paths remain rejected elsewhere; exact error provenance is not contracted. | No |
| #168 | `replaceOccurrence` | Empties the foreign-occurrence message. | Exact aggregate-membership failure wording. | Pending decision | Membership rejection exists, but exact wording is not confirmed. | Pending decision |
| #184 | `resolveOccurrence` | Empties the foreign-occurrence message. | Exact aggregate-membership failure wording. | Pending decision | Exact wording is not confirmed. | Pending decision |
| #211 | `assertTransition` | Empties the lifecycle-transition message. | Exact transition failure wording. | Pending decision | Exact wording is not confirmed. | Pending decision |
| #223 | `assertNoActiveOccurrence` | Empties the active-occurrence message. | Exact pause/cancel rejection wording. | Pending decision | BV-06 confirms rejection, not message text. | Pending decision |
| #231 | `assertActiveForOccurrenceCommand` | Empties the inactive-parent message. | Exact start/skip rejection wording. | Pending decision | Exact wording is not confirmed. | Pending decision |
| #232 | `assertCanResolveOccurrence` | Removes the complete parent-state guard body. | Terminal-parent requests fail later through child-state validation. | Non-actionable | Valid confirmed execution paths are unchanged; this affects defensive error provenance. | No |
| #234 | `assertCanResolveOccurrence` | Makes the guard condition always false. | Same guard bypass as #232. | Non-actionable | No confirmed valid behavior changes; downstream child invariants still reject invalid transitions. | No |
| #254 | `assertNextPendingOccurrence` | Empties the schedule-order failure message. | Exact wrong-occurrence message wording. | Pending decision | Exact wording is not confirmed. | Pending decision |
| #257 | `withState` | Replaces nullish fallback with logical AND for `sourceTrainingProgramId`. | Ordinary transitions may erase retained source-program provenance. | Resolved | The parameterized domain test now verifies provenance retention through pause, resume, cancellation, and occurrence transitions; the incremental mutation rerun killed this mutant. | No |
| #263 | `withState` completed timestamp selection | Forces the outer condition to false. | Unspecified completion timestamps become null instead of retaining the previous value. | Equivalent | On reachable nonterminal transitions the previous value is already null; terminal programs cannot transition through this path. | No |
| #266 | `withState` cancellation timestamp selection | Forces the outer condition to false. | Unspecified cancellation timestamps become null instead of retaining the previous value. | Equivalent | On reachable nonterminal transitions the prior value is null; terminal transitions are blocked. | No |
| #269 | `withState` | Removes `validateAggregateState`. | Transition results are no longer revalidated. | Equivalent | With one mutant at a time, existing public transitions already construct valid states from valid aggregates; no confirmed valid path changes observably. | No |
| #275 | `reconstituteOccurrences` | Removes occurrence sorting after reconstitution. | Persisted children may remain in database-provided order, changing next-occurrence selection. | Resolved | The reconstitution test now asserts canonical `weekNumber`/`dayNumber` ordering and the correct next pending occurrence; the incremental mutation rerun killed this mutant. | No |
| #282 | `validateAggregateState` | Empties the `updatedAt` chronology message. | Exact corrupted-timestamp wording. | Pending decision | Timestamp error wording is not confirmed. | Pending decision |
| #312 | `validateParentChildLifecycle` | Empties the completed-parent contradiction message. | Exact BV-02 failure wording. | Pending decision | BV-02 confirms rejection, not wording. | Pending decision |
| #321 | `validateParentChildLifecycle` | Empties the cancelled-parent contradiction message. | Exact BV-02 failure wording. | Pending decision | BV-02 confirms rejection, not wording. | Pending decision |
| #331 | `validateParentChildLifecycle` | Empties the active/all-resolved contradiction message. | Exact BV-02 failure wording. | Pending decision | BV-02 confirms rejection, not wording. | Pending decision |
| #334 | `validateOccurrences` | Disables the zero-occurrence condition. | The dedicated empty-occurrence guard is bypassed, but another aggregate invariant still rejects the same empty ACTIVE state. | Equivalent | Creation and reconstitution remain observably rejected under NE-01 and NE-05. Distinguishing the guards would require asserting unconfirmed internal error provenance. | No |
| #336 | `validateOccurrences` | Replaces the empty-schedule throw block with an empty block. | The dedicated throw is removed, but another aggregate invariant still rejects the same empty ACTIVE state. | Equivalent | The confirmed rejection remains observable and covered. Killing this mutant would require coupling a test to internal validation order or unconfirmed wording. | No |
| #338 | `validateOccurrences` | Empties the zero-occurrence error message. | Exact empty-aggregate wording. | Pending decision | Rejection and stable external code are confirmed, not domain message text. | Pending decision |
| #341 | `validateOccurrences` | Disables child-parent identifier comparison. | Reconstitution may accept a child belonging to another aggregate. | Resolved | The reconstitution test now proves that every occurrence must reference the containing aggregate ID; the incremental mutation rerun killed this mutant. | No |
| #353 | `validateOccurrences` | Empties the out-of-duration message. | Exact schedule-boundary wording. | Pending decision | BC-04 confirms rejection and HTTP status, not domain message text. | Pending decision |
| #358 | `validateOccurrences` | Empties the duplicate-slot message. | Exact duplicate-position wording. | Pending decision | Duplicate-position behavior/message is not defined in the catalog. | Pending decision |
| #380 | `validateLifecycleTimestamps` | Disables completed-status timestamp validation branch. | COMPLETED state may lack `completedAt` or include `cancelledAt`. | Resolved | The lifecycle timestamp matrix is confirmed and covered by one parameterized reconstitution test. | No |
| #386 | `validateLifecycleTimestamps` | Changes completed timestamp invalidity from OR to AND. | Several malformed COMPLETED timestamp combinations become valid. | Resolved | The same lifecycle timestamp matrix rejects missing and conflicting terminal timestamps. | No |
| #401 | `validateLifecycleTimestamps` | Disables rejection of `cancelledAt` on non-cancelled states. | ACTIVE, PAUSED, or COMPLETED states may retain cancellation timestamps. | Resolved | The same lifecycle timestamp matrix rejects terminal timestamps on non-terminal states. | No |
| #408 | `validateLifecycleTimestamps` | Empties the lifecycle-timestamp message. | Exact malformed-state wording. | Pending decision | Exact wording is not confirmed. | Pending decision |
| #410 | `validateLifecycleTimestamps` | Disables rejection when completion precedes start. | Chronologically impossible completed programs may reconstitute. | Resolved | The confirmed lifecycle timestamp matrix includes terminal timestamps that precede `startedAt` and rejects them. | No |
| #420 | `validateLifecycleTimestamps` | Empties the cancellation-before-start message. | Exact chronology failure wording. | Pending decision | Exact wording is not confirmed. | Pending decision |
| #421 | `AdoptedTrainingProgramValidationError.code` | Empties the stable domain error code. | Validation responses may lose their machine-readable code. | Resolved | A literal HTTP-body assertion now protects the BV-05 code; the incremental mutation rerun killed this mutant. | No |
| #422 | `AdoptedTrainingProgramValidationError.constructor` | Empties `Error.name`. | Diagnostic error-name preservation. | Non-actionable | Implementation detail. | No |
| #423 | `AdoptedTrainingProgramLifecycleError.code` | Empties the stable domain error code. | Lifecycle responses may lose their machine-readable code. | Resolved | A literal HTTP-body assertion now protects the BV-05 code; the incremental mutation rerun killed this mutant. | No |
| #424 | `AdoptedTrainingProgramLifecycleError.constructor` | Empties `Error.name`. | Diagnostic error-name preservation. | Non-actionable | Implementation detail. | No |
| #425 | `ProgramWorkoutOccurrenceValidationError.code` | Empties the stable domain error code. | Occurrence validation responses may lose their code. | Resolved | A literal HTTP-body assertion now protects the BV-05 code; the incremental mutation rerun killed this mutant. | No |
| #426 | `ProgramWorkoutOccurrenceValidationError.constructor` | Empties `Error.name`. | Diagnostic error-name preservation. | Non-actionable | Implementation detail. | No |
| #427 | `ProgramWorkoutOccurrenceLifecycleError.code` | Empties the stable domain error code. | Occurrence lifecycle responses may lose their code. | Resolved | A runtime-created error fixture and literal HTTP-body assertion now protect the BV-05 code; the incremental mutation rerun killed this static mutant. | No |
| #428 | `ProgramWorkoutOccurrenceLifecycleError.constructor` | Empties `Error.name`. | Diagnostic error-name preservation. | Non-actionable | Implementation detail. | No |
| #434 | `ProgramWorkoutOccurrence` constructor validation | Empties the `updatedAt` chronology message. | Exact corrupted-timestamp wording. | Pending decision | Exact wording is not confirmed. | Pending decision |
| #439 | `ProgramWorkoutOccurrence.create` | Empties the source-program-routine label used in UUID errors. | Error message no longer identifies the invalid provenance field. | Pending decision | NE-03 confirms rejection, but not field-label wording. | Pending decision |
| #440 | `ProgramWorkoutOccurrence.create` | Empties the source-routine label used in UUID errors. | Error message no longer identifies the invalid provenance field. | Pending decision | NE-03 does not confirm exact wording. | Pending decision |
| #445 | `ProgramWorkoutOccurrence.reconstitute` | Empties the source-program-routine label. | Reconstitution error message loses field identification. | Pending decision | Exact error wording is not confirmed. | Pending decision |
| #446 | `ProgramWorkoutOccurrence.reconstitute` | Empties the source-routine label. | Reconstitution error message loses field identification. | Pending decision | Exact error wording is not confirmed. | Pending decision |
| #465 | `ProgramWorkoutOccurrence.transition` | Empties the lifecycle error message. | Exact occurrence-transition wording. | Pending decision | Lifecycle outcome is observable, but exact wording is not confirmed. | Pending decision |
| #480 | `createOptionalSourceId` | Empties the invalid-provenance message. | Exact NE-03 validation wording. | Pending decision | NE-03 confirms rejection, not message text. | Pending decision |
| #497 | `AdoptedProgramDuration.create` | Empties the invalid-duration message. | Exact BC-04 validation wording. | Pending decision | BC-04 confirms range and HTTP status, not domain wording. | Pending decision |
| #510 | `AdoptedProgramNameSnapshot.create` | Changes minimum rejection from `<2` to `<=2`. | A two-character program name becomes invalid. | Resolved | The approved 2–120 character contract is covered at its minimum boundary; the targeted mutation rerun killed this mutant. | No |
| #512 | `AdoptedProgramNameSnapshot.create` | Disables all length validation. | Too-short and overlong program names become valid. | Resolved | The approved contract is covered immediately below and above its valid range; the targeted mutation rerun killed this mutant. | No |
| #513 | `AdoptedProgramNameSnapshot.create` | Changes maximum rejection from `>120` to `>=120`. | Exactly 120 characters becomes invalid. | Resolved | The approved 2–120 character contract is covered at its maximum boundary; the targeted mutation rerun killed this mutant. | No |
| #517 | `AdoptedProgramNameSnapshot.create` | Empties the length-validation message. | Exact program-name validation wording. | Pending decision | Neither the exact bound contract nor wording is cataloged. | Pending decision |
| #525 | `RoutineNameSnapshot.create` | Changes the minimum routine-name boundary. | A routine-name snapshot outside the approved minimum may be accepted. | Resolved | The snapshot now follows the source routine's approved 2–120 character contract, covered at its minimum boundary; the targeted mutation rerun killed this mutant. | No |
| #527 | `RoutineNameSnapshot.create` | Disables all length validation. | Too-short and overlong routine names become valid. | Resolved | The approved contract is covered immediately below and above its valid range; the targeted mutation rerun killed this mutant. | No |
| #528 | `RoutineNameSnapshot.create` | Changes maximum rejection from `>120` to `>=120`. | Exactly 120 characters becomes invalid. | Resolved | The approved 2–120 character contract is covered at its maximum boundary; the targeted mutation rerun killed this mutant. | No |
| #532 | `RoutineNameSnapshot.create` | Empties the validation message. | Exact routine-name validation wording. | Pending decision | Exact wording is not confirmed. | Pending decision |
| #544 | `ProgramSlotNotesSnapshot.create` | Changes maximum rejection from `>1000` to `>=1000`. | Exactly 1,000 characters becomes invalid. | Resolved | The snapshot follows the source schedule's approved 1,000-character maximum, now covered at the exact boundary; the targeted mutation rerun killed this mutant. | No |
| #548 | `ProgramSlotNotesSnapshot.create` | Empties the validation message. | Exact notes-length failure wording. | Pending decision | Exact wording is not confirmed. | Pending decision |
| #557 | `AdoptedProgramTimestamp.create` | Empties the invalid-timestamp message. | Exact timestamp validation wording. | Pending decision | Exact wording is not confirmed. | Pending decision |
| #571 | `AdoptedTrainingProgramStatus.create` | Empties the invalid-status message. | Exact program-status validation wording. | Pending decision | Exact wording is not confirmed. | Pending decision |
| #585 | `ProgramWorkoutOccurrenceStatus.create` | Empties the invalid-status message. | Exact occurrence-status validation wording. | Pending decision | Exact wording is not confirmed. | Pending decision |
| #602 | `ProgramWorkoutSlot.create` | Empties the invalid-week message. | Exact week-boundary validation wording. | Pending decision | BC-04 confirms rejection/status, not exact wording. | Pending decision |
| #612 | `ProgramWorkoutSlot.create` | Disables the upper day-number bound. | Values above 364 become valid. | Resolved | A BC-04 boundary test now rejects day 365; the incremental mutation rerun killed this mutant. | No |
| #613 | `ProgramWorkoutSlot.create` | Changes upper rejection from `>364` to `>=364`. | The confirmed maximum value 364 becomes invalid. | Resolved | The same BC-04 boundary test now accepts day 364; the incremental mutation rerun killed this mutant. | No |
| #617 | `ProgramWorkoutSlot.create` | Empties the invalid-day message. | Exact day-boundary validation wording. | Pending decision | BC-04 does not confirm exact wording. | Pending decision |

## Verification update

The latest targeted incremental mutation rerun completed with 556 mutants: 282
killed, 65 survived, 4 had no coverage, and 205 produced compile errors. The
mutation score is **80.34%**. The lifecycle matrix test covers the behaviors previously
represented by **#380, #386, #401, and #410**; Stryker refreshed some numeric
identifiers after the production lifecycle cleanup, so those historical IDs
should not be compared directly with the current JSON report.

The approved 2–120 character program-name snapshot test killed the three
boundary and validation mutants historically identified as **#510, #512, and
#513**. The explicit `AdoptedTrainingProgram.complete()` operation remains
removed by approved decision, so its eleven historical survivors are obsolete.

The approved 2–120 character routine-name snapshot test killed the three
boundary and validation mutants historically identified as **#525, #527, and
#528**.

The exact 1,000-character program-slot notes boundary test killed the
off-by-one mutant historically identified as **#544**.

Mutants **#334** and **#336** remain surviving but are now classified as
equivalent because bypassing the dedicated empty-occurrence guard still reaches
another aggregate invariant that rejects the same state. Existing tests protect
the confirmed NE-01 and NE-05 behavior without depending on validation order or
error wording.

## Current summary

- **Baseline surviving mutants:** 94
- **Resolved by the latest test iterations:** 22
- **Current surviving mutants:** 65
- **Actionable survivors:** 0
- **Equivalent survivors:** 5
- **Non-actionable survivors:** 16
- **Pending decision survivors after approved reclassification:** 40

### Next test-writing iteration

No actionable survivor remains from this analysis. Equivalent and
non-actionable mutants should remain intentionally surviving. The pending
decision survivors still require contract decisions before they drive tests.
