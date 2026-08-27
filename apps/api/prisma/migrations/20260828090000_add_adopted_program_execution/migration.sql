-- CreateEnum
CREATE TYPE "UserTrainingProgramStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "UserProgramWorkoutStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');

-- CreateTable
CREATE TABLE "UserTrainingProgram" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "sourceTrainingProgramId" UUID,
    "programNameSnapshot" TEXT NOT NULL,
    "durationWeeksSnapshot" INTEGER NOT NULL,
    "status" "UserTrainingProgramStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMPTZ(3) NOT NULL,
    "completedAt" TIMESTAMPTZ(3),
    "cancelledAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "UserTrainingProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProgramWorkout" (
    "id" UUID NOT NULL,
    "userTrainingProgramId" UUID NOT NULL,
    "sourceTrainingProgramRoutineId" UUID,
    "sourceRoutineId" UUID,
    "weekNumber" INTEGER NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "routineNameSnapshot" TEXT NOT NULL,
    "programSlotNotesSnapshot" TEXT,
    "status" "UserProgramWorkoutStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "UserProgramWorkout_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "WorkoutSession" ADD COLUMN "userProgramWorkoutId" UUID;

-- CreateIndex
CREATE INDEX "UserTrainingProgram_ownerId_status_updatedAt_idx" ON "UserTrainingProgram"("ownerId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "UserTrainingProgram_sourceTrainingProgramId_idx" ON "UserTrainingProgram"("sourceTrainingProgramId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgramWorkout_userTrainingProgramId_weekNumber_dayNumber_key" ON "UserProgramWorkout"("userTrainingProgramId", "weekNumber", "dayNumber");

-- CreateIndex
CREATE INDEX "UserProgramWorkout_userTrainingProgramId_weekNumber_dayNumber_idx" ON "UserProgramWorkout"("userTrainingProgramId", "weekNumber", "dayNumber");

-- CreateIndex
CREATE INDEX "UserProgramWorkout_userTrainingProgramId_status_weekNumber_dayNumber_idx" ON "UserProgramWorkout"("userTrainingProgramId", "status", "weekNumber", "dayNumber");

-- CreateIndex
CREATE INDEX "UserProgramWorkout_sourceTrainingProgramRoutineId_idx" ON "UserProgramWorkout"("sourceTrainingProgramRoutineId");

-- CreateIndex
CREATE INDEX "UserProgramWorkout_sourceRoutineId_idx" ON "UserProgramWorkout"("sourceRoutineId");

-- CreateIndex
CREATE INDEX "WorkoutSession_userProgramWorkoutId_idx" ON "WorkoutSession"("userProgramWorkoutId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTrainingProgram_one_non_terminal_per_owner_idx"
ON "UserTrainingProgram" ("ownerId")
WHERE "status" IN ('ACTIVE', 'PAUSED');

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutSession_one_in_progress_per_program_workout_idx"
ON "WorkoutSession" ("userProgramWorkoutId")
WHERE "userProgramWorkoutId" IS NOT NULL AND "status" = 'IN_PROGRESS';

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutSession_one_completed_per_program_workout_idx"
ON "WorkoutSession" ("userProgramWorkoutId")
WHERE "userProgramWorkoutId" IS NOT NULL AND "status" = 'COMPLETED';

-- AddForeignKey
ALTER TABLE "UserTrainingProgram" ADD CONSTRAINT "UserTrainingProgram_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTrainingProgram" ADD CONSTRAINT "UserTrainingProgram_sourceTrainingProgramId_fkey" FOREIGN KEY ("sourceTrainingProgramId") REFERENCES "TrainingProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgramWorkout" ADD CONSTRAINT "UserProgramWorkout_userTrainingProgramId_fkey" FOREIGN KEY ("userTrainingProgramId") REFERENCES "UserTrainingProgram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgramWorkout" ADD CONSTRAINT "UserProgramWorkout_sourceTrainingProgramRoutineId_fkey" FOREIGN KEY ("sourceTrainingProgramRoutineId") REFERENCES "TrainingProgramRoutine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgramWorkout" ADD CONSTRAINT "UserProgramWorkout_sourceRoutineId_fkey" FOREIGN KEY ("sourceRoutineId") REFERENCES "Routine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_userProgramWorkoutId_fkey" FOREIGN KEY ("userProgramWorkoutId") REFERENCES "UserProgramWorkout"("id") ON DELETE SET NULL ON UPDATE CASCADE;
