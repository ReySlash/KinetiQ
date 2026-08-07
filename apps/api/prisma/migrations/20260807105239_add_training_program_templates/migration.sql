-- CreateEnum
CREATE TYPE "TrainingProgramVisibility" AS ENUM ('PRIVATE', 'GLOBAL');

-- CreateTable
CREATE TABLE "TrainingProgram" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "visibility" "TrainingProgramVisibility" NOT NULL DEFAULT 'PRIVATE',
    "durationWeeks" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "TrainingProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingProgramRoutine" (
    "id" UUID NOT NULL,
    "trainingProgramId" UUID NOT NULL,
    "routineId" UUID NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "TrainingProgramRoutine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrainingProgram_slug_key" ON "TrainingProgram"("slug");

-- CreateIndex
CREATE INDEX "TrainingProgram_ownerId_updatedAt_idx" ON "TrainingProgram"("ownerId", "updatedAt");

-- CreateIndex
CREATE INDEX "TrainingProgram_ownerId_name_idx" ON "TrainingProgram"("ownerId", "name");

-- CreateIndex
CREATE INDEX "TrainingProgram_visibility_updatedAt_idx" ON "TrainingProgram"("visibility", "updatedAt");

-- CreateIndex
CREATE INDEX "TrainingProgramRoutine_trainingProgramId_weekNumber_dayNumb_idx" ON "TrainingProgramRoutine"("trainingProgramId", "weekNumber", "dayNumber");

-- CreateIndex
CREATE INDEX "TrainingProgramRoutine_routineId_idx" ON "TrainingProgramRoutine"("routineId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingProgramRoutine_trainingProgramId_weekNumber_dayNumb_key" ON "TrainingProgramRoutine"("trainingProgramId", "weekNumber", "dayNumber");

-- AddForeignKey
ALTER TABLE "TrainingProgram" ADD CONSTRAINT "TrainingProgram_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingProgramRoutine" ADD CONSTRAINT "TrainingProgramRoutine_trainingProgramId_fkey" FOREIGN KEY ("trainingProgramId") REFERENCES "TrainingProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingProgramRoutine" ADD CONSTRAINT "TrainingProgramRoutine_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
