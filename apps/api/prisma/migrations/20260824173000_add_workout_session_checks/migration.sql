-- Preserve the WorkoutSession lifecycle invariants at the database boundary.
ALTER TABLE "WorkoutSession"
ADD CONSTRAINT "WorkoutSession_lifecycle_timestamps_check"
CHECK (
  ("status" = 'IN_PROGRESS' AND "completedAt" IS NULL AND "cancelledAt" IS NULL)
  OR ("status" = 'COMPLETED' AND "completedAt" IS NOT NULL AND "cancelledAt" IS NULL)
  OR ("status" = 'CANCELLED' AND "completedAt" IS NULL AND "cancelledAt" IS NOT NULL)
);

ALTER TABLE "WorkoutSession"
ADD CONSTRAINT "WorkoutSession_completedAt_after_startedAt_check"
CHECK ("completedAt" IS NULL OR "completedAt" >= "startedAt");

ALTER TABLE "WorkoutSession"
ADD CONSTRAINT "WorkoutSession_cancelledAt_after_startedAt_check"
CHECK ("cancelledAt" IS NULL OR "cancelledAt" >= "startedAt");

ALTER TABLE "ExercisePerformance"
ADD CONSTRAINT "ExercisePerformance_order_non_negative_check"
CHECK ("order" >= 0);

ALTER TABLE "ExercisePerformance"
ADD CONSTRAINT "ExercisePerformance_prescription_fields_check"
CHECK (
  (
    "targetSetCount" IS NULL
    AND "targetMinReps" IS NULL
    AND "targetMaxReps" IS NULL
    AND "targetRir" IS NULL
    AND "targetRestSeconds" IS NULL
    AND "targetTempo" IS NULL
    AND "prescriptionNotes" IS NULL
  )
  OR (
    "targetSetCount" IS NOT NULL
    AND "targetMinReps" IS NOT NULL
    AND "targetMaxReps" IS NOT NULL
  )
);

ALTER TABLE "ExercisePerformance"
ADD CONSTRAINT "ExercisePerformance_target_set_count_check"
CHECK ("targetSetCount" IS NULL OR "targetSetCount" BETWEEN 1 AND 20);

ALTER TABLE "ExercisePerformance"
ADD CONSTRAINT "ExercisePerformance_target_reps_check"
CHECK (
  ("targetMinReps" IS NULL OR "targetMinReps" BETWEEN 1 AND 1000)
  AND ("targetMaxReps" IS NULL OR "targetMaxReps" BETWEEN 1 AND 1000)
  AND ("targetMinReps" IS NULL OR "targetMaxReps" IS NULL OR "targetMinReps" <= "targetMaxReps")
);

ALTER TABLE "ExercisePerformance"
ADD CONSTRAINT "ExercisePerformance_target_rir_check"
CHECK ("targetRir" IS NULL OR "targetRir" BETWEEN 0 AND 10);

ALTER TABLE "ExercisePerformance"
ADD CONSTRAINT "ExercisePerformance_target_rest_check"
CHECK ("targetRestSeconds" IS NULL OR "targetRestSeconds" BETWEEN 0 AND 3600);

ALTER TABLE "CompletedSet"
ADD CONSTRAINT "CompletedSet_order_non_negative_check"
CHECK ("order" >= 0);

ALTER TABLE "CompletedSet"
ADD CONSTRAINT "CompletedSet_repetitions_check"
CHECK ("repetitions" BETWEEN 0 AND 1000);

ALTER TABLE "CompletedSet"
ADD CONSTRAINT "CompletedSet_load_kg_check"
CHECK ("loadKg" >= 0 AND "loadKg" <= 99999.99);

ALTER TABLE "CompletedSet"
ADD CONSTRAINT "CompletedSet_rir_check"
CHECK ("rir" IS NULL OR "rir" BETWEEN 0 AND 10);
