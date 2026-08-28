-- The composite unique index already supports adopted-program slot lookups.
-- Keep the status-aware index for next-pending-occurrence queries.
DROP INDEX "ProgramWorkoutOccurrence_adopted_slot_idx";
