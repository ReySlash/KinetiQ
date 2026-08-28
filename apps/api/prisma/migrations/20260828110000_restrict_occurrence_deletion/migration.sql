-- Preserve adopted-program occurrence references from historical workout sessions.
ALTER TABLE "WorkoutSession"
  DROP CONSTRAINT "WorkoutSession_programWorkoutOccurrenceId_fkey";

ALTER TABLE "WorkoutSession"
  ADD CONSTRAINT "WorkoutSession_programWorkoutOccurrenceId_fkey"
  FOREIGN KEY ("programWorkoutOccurrenceId")
  REFERENCES "ProgramWorkoutOccurrence"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;
