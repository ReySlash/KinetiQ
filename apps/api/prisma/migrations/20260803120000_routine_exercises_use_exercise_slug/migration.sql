-- Preserve existing routine references while changing the application contract
-- from Exercise.id to the immutable, unique Exercise.slug.
ALTER TABLE "RoutineExercise"
ADD COLUMN "exerciseSlug_new" TEXT;

UPDATE "RoutineExercise" AS routine_exercise
SET "exerciseSlug_new" = exercise.slug
FROM "Exercise" AS exercise
WHERE routine_exercise."exerciseId" = exercise.id;

ALTER TABLE "RoutineExercise"
ALTER COLUMN "exerciseSlug_new" SET NOT NULL;

ALTER TABLE "RoutineExercise"
DROP CONSTRAINT "RoutineExercise_exerciseId_fkey";

DROP INDEX "RoutineExercise_exerciseId_idx";

ALTER TABLE "RoutineExercise"
DROP COLUMN "exerciseId";

ALTER TABLE "RoutineExercise"
RENAME COLUMN "exerciseSlug_new" TO "exerciseSlug";

CREATE INDEX "RoutineExercise_exerciseSlug_idx"
ON "RoutineExercise"("exerciseSlug");

ALTER TABLE "RoutineExercise"
ADD CONSTRAINT "RoutineExercise_exerciseSlug_fkey"
FOREIGN KEY ("exerciseSlug") REFERENCES "Exercise"("slug")
ON DELETE RESTRICT ON UPDATE CASCADE;
