-- Preserve adopted-program data while aligning persistence names with the
-- approved domain vocabulary.

ALTER TYPE "UserTrainingProgramStatus" RENAME TO "AdoptedTrainingProgramStatus";
ALTER TYPE "UserProgramWorkoutStatus" RENAME TO "ProgramWorkoutOccurrenceStatus";

ALTER TABLE "UserTrainingProgram" RENAME TO "AdoptedTrainingProgram";
ALTER TABLE "UserProgramWorkout" RENAME TO "ProgramWorkoutOccurrence";

ALTER TABLE "ProgramWorkoutOccurrence"
  RENAME COLUMN "userTrainingProgramId" TO "adoptedTrainingProgramId";
ALTER TABLE "WorkoutSession"
  RENAME COLUMN "userProgramWorkoutId" TO "programWorkoutOccurrenceId";

ALTER TABLE "AdoptedTrainingProgram"
  RENAME CONSTRAINT "UserTrainingProgram_pkey" TO "AdoptedTrainingProgram_pkey";
ALTER TABLE "ProgramWorkoutOccurrence"
  RENAME CONSTRAINT "UserProgramWorkout_pkey" TO "ProgramWorkoutOccurrence_pkey";
ALTER TABLE "AdoptedTrainingProgram"
  RENAME CONSTRAINT "UserTrainingProgram_ownerId_fkey" TO "AdoptedTrainingProgram_ownerId_fkey";
ALTER TABLE "AdoptedTrainingProgram"
  RENAME CONSTRAINT "UserTrainingProgram_sourceTrainingProgramId_fkey" TO "AdoptedTrainingProgram_sourceTrainingProgramId_fkey";
ALTER TABLE "ProgramWorkoutOccurrence"
  RENAME CONSTRAINT "UserProgramWorkout_userTrainingProgramId_fkey" TO "ProgramWorkoutOccurrence_adoptedTrainingProgramId_fkey";
ALTER TABLE "ProgramWorkoutOccurrence"
  RENAME CONSTRAINT "UserProgramWorkout_sourceTrainingProgramRoutineId_fkey" TO "ProgramWorkoutOccurrence_sourceTrainingProgramRoutineId_fkey";
ALTER TABLE "ProgramWorkoutOccurrence"
  RENAME CONSTRAINT "UserProgramWorkout_sourceRoutineId_fkey" TO "ProgramWorkoutOccurrence_sourceRoutineId_fkey";
ALTER TABLE "WorkoutSession"
  RENAME CONSTRAINT "WorkoutSession_userProgramWorkoutId_fkey" TO "WorkoutSession_programWorkoutOccurrenceId_fkey";

ALTER INDEX "UserTrainingProgram_ownerId_status_updatedAt_idx"
  RENAME TO "AdoptedTrainingProgram_ownerId_status_updatedAt_idx";
ALTER INDEX "UserTrainingProgram_sourceTrainingProgramId_idx"
  RENAME TO "AdoptedTrainingProgram_sourceTrainingProgramId_idx";
ALTER INDEX "UserProgramWorkout_userTrainingProgramId_weekNumber_dayNumber_key"
  RENAME TO "ProgramWorkoutOccurrence_adopted_slot_key";
ALTER INDEX "UserProgramWorkout_userTrainingProgramId_weekNumber_dayNumber_idx"
  RENAME TO "ProgramWorkoutOccurrence_adopted_slot_idx";
ALTER INDEX "UserProgramWorkout_userTrainingProgramId_status_weekNumber_dayNumber_idx"
  RENAME TO "ProgramWorkoutOccurrence_status_slot_idx";
ALTER INDEX "UserProgramWorkout_sourceTrainingProgramRoutineId_idx"
  RENAME TO "ProgramWorkoutOccurrence_sourceTrainingProgramRoutineId_idx";
ALTER INDEX "UserProgramWorkout_sourceRoutineId_idx"
  RENAME TO "ProgramWorkoutOccurrence_sourceRoutineId_idx";
ALTER INDEX "WorkoutSession_userProgramWorkoutId_idx"
  RENAME TO "WorkoutSession_programWorkoutOccurrenceId_idx";
ALTER INDEX "UserTrainingProgram_one_non_terminal_per_owner_idx"
  RENAME TO "AdoptedTrainingProgram_one_non_terminal_per_owner_idx";
ALTER INDEX "WorkoutSession_one_in_progress_per_program_workout_idx"
  RENAME TO "WorkoutSession_one_in_progress_per_occurrence_idx";
ALTER INDEX "WorkoutSession_one_completed_per_program_workout_idx"
  RENAME TO "WorkoutSession_one_completed_per_occurrence_idx";
