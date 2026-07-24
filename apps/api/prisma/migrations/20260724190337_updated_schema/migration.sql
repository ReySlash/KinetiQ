-- CreateEnum
CREATE TYPE "MuscleFunctionRole" AS ENUM ('PRIMARY', 'SECONDARY');

-- AlterTable
ALTER TABLE "MuscleGroup" ADD COLUMN     "bodyRegion" "BodyRegion";

-- CreateTable
CREATE TABLE "MuscleFunction" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "MuscleFunction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MuscleFunctionAssignment" (
    "muscleId" UUID NOT NULL,
    "functionId" UUID NOT NULL,
    "role" "MuscleFunctionRole" NOT NULL,
    "contributionScore" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "MuscleFunctionAssignment_pkey" PRIMARY KEY ("muscleId","functionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "MuscleFunction_name_key" ON "MuscleFunction"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MuscleFunction_slug_key" ON "MuscleFunction"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MuscleFunctionAssignment_one_primary_per_muscle" ON "MuscleFunctionAssignment" ("muscleId") WHERE "role" = 'PRIMARY';

-- CreateIndex
CREATE INDEX "MuscleFunctionAssignment_functionId_role_idx" ON "MuscleFunctionAssignment"("functionId", "role");

-- CreateIndex
CREATE INDEX "MuscleFunctionAssignment_muscleId_role_idx" ON "MuscleFunctionAssignment"("muscleId", "role");

-- AddForeignKey
ALTER TABLE "MuscleFunctionAssignment" ADD CONSTRAINT "MuscleFunctionAssignment_muscleId_fkey" FOREIGN KEY ("muscleId") REFERENCES "Muscle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MuscleFunctionAssignment" ADD CONSTRAINT "MuscleFunctionAssignment_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "MuscleFunction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
