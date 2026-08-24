ALTER TABLE "WorkoutSession"
ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "WorkoutSession"
ADD CONSTRAINT "WorkoutSession_version_non_negative_check"
CHECK ("version" >= 0);
