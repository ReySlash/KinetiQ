-- CreateEnum
CREATE TYPE "BodyRegion" AS ENUM ('UPPER_BODY', 'LOWER_BODY', 'CORE', 'FULL_BODY', 'OTHER');

-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', 'OTHER');

-- CreateEnum
CREATE TYPE "ForceType" AS ENUM ('PUSH', 'PULL', 'STATIC', 'OTHER');

-- CreateEnum
CREATE TYPE "KineticChain" AS ENUM ('OPEN', 'CLOSED', 'MIXED');

-- CreateEnum
CREATE TYPE "Laterality" AS ENUM ('UNILATERAL', 'BILATERAL', 'ALTERNATING', 'OTHER');

-- CreateEnum
CREATE TYPE "ContractionMode" AS ENUM ('DYNAMIC', 'ISOMETRIC', 'MIXED');

-- CreateEnum
CREATE TYPE "BodyPosition" AS ENUM ('STANDING', 'SITTING', 'SUPINE', 'PRONE', 'KNEELING', 'HINGED', 'INVERTED', 'OTHER');

-- CreateEnum
CREATE TYPE "MuscleRole" AS ENUM ('PRIMARY', 'SECONDARY', 'STABILIZER');

-- CreateEnum
CREATE TYPE "RoutineVisibility" AS ENUM ('PRIVATE');

-- CreateTable
CREATE TABLE "MuscleGroup" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "MuscleGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Muscle" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "bodyRegion" "BodyRegion" NOT NULL,
    "muscleGroupId" UUID,
    "parentId" UUID,
    "thumbnailUrl" TEXT,
    "thumbnailStorageKey" TEXT,
    "imageAltText" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Muscle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovementPattern" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "MovementPattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "commonMistakes" TEXT,
    "movementPatternId" UUID,
    "forceType" "ForceType" NOT NULL,
    "kineticChain" "KineticChain" NOT NULL,
    "isCompound" BOOLEAN NOT NULL,
    "laterality" "Laterality" NOT NULL,
    "contractionMode" "ContractionMode" NOT NULL,
    "bodyPosition" "BodyPosition" NOT NULL,
    "skillLevel" "SkillLevel" NOT NULL,
    "thumbnailUrl" TEXT,
    "thumbnailStorageKey" TEXT,
    "imageAltText" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "archivedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseEquipment" (
    "exerciseId" UUID NOT NULL,
    "equipmentId" UUID NOT NULL,

    CONSTRAINT "ExerciseEquipment_pkey" PRIMARY KEY ("exerciseId","equipmentId")
);

-- CreateTable
CREATE TABLE "ExerciseMuscle" (
    "exerciseId" UUID NOT NULL,
    "muscleId" UUID NOT NULL,
    "role" "MuscleRole" NOT NULL,
    "involvementScore" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ExerciseMuscle_pkey" PRIMARY KEY ("exerciseId","muscleId")
);

-- CreateTable
CREATE TABLE "ExerciseCapabilityProfile" (
    "exerciseId" UUID NOT NULL,
    "hypertrophyPotential" INTEGER NOT NULL,
    "maximalStrengthPotential" INTEGER NOT NULL,
    "powerDevelopmentPotential" INTEGER NOT NULL,
    "muscularEndurancePotential" INTEGER NOT NULL,
    "stabilityDevelopmentPotential" INTEGER NOT NULL,
    "typicalLoadability" INTEGER NOT NULL,
    "stretchPositionLoading" INTEGER NOT NULL,
    "shortenedPositionLoading" INTEGER NOT NULL,
    "editorialNotes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ExerciseCapabilityProfile_pkey" PRIMARY KEY ("exerciseId")
);

-- CreateTable
CREATE TABLE "ExerciseDemandProfile" (
    "exerciseId" UUID NOT NULL,
    "technicalDemand" INTEGER NOT NULL,
    "setupComplexity" INTEGER NOT NULL,
    "stabilityDemand" INTEGER NOT NULL,
    "systemicFatiguePotential" INTEGER NOT NULL,
    "localFatiguePotential" INTEGER NOT NULL,
    "recoveryCostPotential" INTEGER NOT NULL,
    "gripDemand" INTEGER NOT NULL,
    "axialLoadingPotential" INTEGER NOT NULL,
    "editorialNotes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ExerciseDemandProfile_pkey" PRIMARY KEY ("exerciseId")
);

-- CreateTable
CREATE TABLE "Routine" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "visibility" "RoutineVisibility" NOT NULL DEFAULT 'PRIVATE',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Routine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineExercise" (
    "id" UUID NOT NULL,
    "routineId" UUID NOT NULL,
    "exerciseId" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "minReps" INTEGER NOT NULL,
    "maxReps" INTEGER NOT NULL,
    "targetRir" INTEGER,
    "restSeconds" INTEGER,
    "tempo" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "RoutineExercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MuscleGroup_slug_key" ON "MuscleGroup"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Muscle_slug_key" ON "Muscle"("slug");

-- CreateIndex
CREATE INDEX "Muscle_bodyRegion_isActive_idx" ON "Muscle"("bodyRegion", "isActive");

-- CreateIndex
CREATE INDEX "Muscle_muscleGroupId_isActive_idx" ON "Muscle"("muscleGroupId", "isActive");

-- CreateIndex
CREATE INDEX "Muscle_parentId_idx" ON "Muscle"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_slug_key" ON "Equipment"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MovementPattern_slug_key" ON "MovementPattern"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_slug_key" ON "Exercise"("slug");

-- CreateIndex
CREATE INDEX "Exercise_isActive_name_idx" ON "Exercise"("isActive", "name");

-- CreateIndex
CREATE INDEX "Exercise_movementPatternId_isActive_idx" ON "Exercise"("movementPatternId", "isActive");

-- CreateIndex
CREATE INDEX "Exercise_skillLevel_isActive_idx" ON "Exercise"("skillLevel", "isActive");

-- CreateIndex
CREATE INDEX "ExerciseEquipment_equipmentId_exerciseId_idx" ON "ExerciseEquipment"("equipmentId", "exerciseId");

-- CreateIndex
CREATE INDEX "ExerciseMuscle_muscleId_role_idx" ON "ExerciseMuscle"("muscleId", "role");

-- CreateIndex
CREATE INDEX "ExerciseMuscle_exerciseId_role_idx" ON "ExerciseMuscle"("exerciseId", "role");

-- CreateIndex
CREATE INDEX "Routine_ownerId_updatedAt_idx" ON "Routine"("ownerId", "updatedAt");

-- CreateIndex
CREATE INDEX "Routine_ownerId_name_idx" ON "Routine"("ownerId", "name");

-- CreateIndex
CREATE INDEX "RoutineExercise_routineId_idx" ON "RoutineExercise"("routineId");

-- CreateIndex
CREATE INDEX "RoutineExercise_exerciseId_idx" ON "RoutineExercise"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "RoutineExercise_routineId_order_key" ON "RoutineExercise"("routineId", "order");

-- AddForeignKey
ALTER TABLE "Muscle" ADD CONSTRAINT "Muscle_muscleGroupId_fkey" FOREIGN KEY ("muscleGroupId") REFERENCES "MuscleGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Muscle" ADD CONSTRAINT "Muscle_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Muscle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_movementPatternId_fkey" FOREIGN KEY ("movementPatternId") REFERENCES "MovementPattern"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseEquipment" ADD CONSTRAINT "ExerciseEquipment_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseEquipment" ADD CONSTRAINT "ExerciseEquipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseMuscle" ADD CONSTRAINT "ExerciseMuscle_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseMuscle" ADD CONSTRAINT "ExerciseMuscle_muscleId_fkey" FOREIGN KEY ("muscleId") REFERENCES "Muscle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseCapabilityProfile" ADD CONSTRAINT "ExerciseCapabilityProfile_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseDemandProfile" ADD CONSTRAINT "ExerciseDemandProfile_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineExercise" ADD CONSTRAINT "RoutineExercise_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineExercise" ADD CONSTRAINT "RoutineExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
