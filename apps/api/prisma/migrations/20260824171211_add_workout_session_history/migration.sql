-- CreateEnum
CREATE TYPE "WorkoutSessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LoadUnit" AS ENUM ('KG', 'LB');

-- CreateTable
CREATE TABLE "WorkoutSession" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "sourceRoutineId" UUID,
    "sourceRoutineNameSnapshot" TEXT,
    "status" "WorkoutSessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "timezone" TEXT NOT NULL,
    "startedAt" TIMESTAMPTZ(3) NOT NULL,
    "completedAt" TIMESTAMPTZ(3),
    "cancelledAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "WorkoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExercisePerformance" (
    "id" UUID NOT NULL,
    "workoutSessionId" UUID NOT NULL,
    "exerciseId" UUID NOT NULL,
    "sourceRoutineExerciseId" UUID,
    "order" INTEGER NOT NULL,
    "exerciseNameSnapshot" TEXT NOT NULL,
    "targetSetCount" INTEGER,
    "targetMinReps" INTEGER,
    "targetMaxReps" INTEGER,
    "targetRir" INTEGER,
    "targetRestSeconds" INTEGER,
    "targetTempo" TEXT,
    "prescriptionNotes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ExercisePerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompletedSet" (
    "id" UUID NOT NULL,
    "exercisePerformanceId" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "repetitions" INTEGER NOT NULL,
    "loadKg" DECIMAL(7,2) NOT NULL,
    "loadUnit" "LoadUnit" NOT NULL,
    "rir" INTEGER,
    "isWarmup" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "CompletedSet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkoutSession_ownerId_startedAt_idx" ON "WorkoutSession"("ownerId", "startedAt");

-- CreateIndex
CREATE INDEX "WorkoutSession_ownerId_status_startedAt_idx" ON "WorkoutSession"("ownerId", "status", "startedAt");

-- CreateIndex
CREATE INDEX "WorkoutSession_sourceRoutineId_idx" ON "WorkoutSession"("sourceRoutineId");

-- CreateIndex
CREATE INDEX "ExercisePerformance_workoutSessionId_idx" ON "ExercisePerformance"("workoutSessionId");

-- CreateIndex
CREATE INDEX "ExercisePerformance_exerciseId_createdAt_idx" ON "ExercisePerformance"("exerciseId", "createdAt");

-- CreateIndex
CREATE INDEX "ExercisePerformance_sourceRoutineExerciseId_idx" ON "ExercisePerformance"("sourceRoutineExerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "ExercisePerformance_workoutSessionId_order_key" ON "ExercisePerformance"("workoutSessionId", "order");

-- CreateIndex
CREATE INDEX "CompletedSet_exercisePerformanceId_idx" ON "CompletedSet"("exercisePerformanceId");

-- CreateIndex
CREATE INDEX "CompletedSet_exercisePerformanceId_completedAt_idx" ON "CompletedSet"("exercisePerformanceId", "completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CompletedSet_exercisePerformanceId_order_key" ON "CompletedSet"("exercisePerformanceId", "order");

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_sourceRoutineId_fkey" FOREIGN KEY ("sourceRoutineId") REFERENCES "Routine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExercisePerformance" ADD CONSTRAINT "ExercisePerformance_workoutSessionId_fkey" FOREIGN KEY ("workoutSessionId") REFERENCES "WorkoutSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExercisePerformance" ADD CONSTRAINT "ExercisePerformance_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExercisePerformance" ADD CONSTRAINT "ExercisePerformance_sourceRoutineExerciseId_fkey" FOREIGN KEY ("sourceRoutineExerciseId") REFERENCES "RoutineExercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompletedSet" ADD CONSTRAINT "CompletedSet_exercisePerformanceId_fkey" FOREIGN KEY ("exercisePerformanceId") REFERENCES "ExercisePerformance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
