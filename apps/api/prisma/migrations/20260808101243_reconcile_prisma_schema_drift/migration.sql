-- AlterTable
ALTER TABLE "MuscleFunction" ALTER COLUMN "id" DROP DEFAULT;

-- Backfill only the established curated muscle groups. Unknown NULL rows must
-- be classified explicitly rather than assigned an invented fallback region.
UPDATE "MuscleGroup" AS muscle_group
SET "bodyRegion" = curated_group."bodyRegion"
FROM (
    VALUES
        ('chest', 'UPPER_BODY'::"BodyRegion"),
        ('back', 'UPPER_BODY'::"BodyRegion"),
        ('shoulders', 'UPPER_BODY'::"BodyRegion"),
        ('biceps', 'UPPER_BODY'::"BodyRegion"),
        ('triceps', 'UPPER_BODY'::"BodyRegion"),
        ('forearms', 'UPPER_BODY'::"BodyRegion"),
        ('core', 'CORE'::"BodyRegion"),
        ('glutes', 'LOWER_BODY'::"BodyRegion"),
        ('quadriceps', 'LOWER_BODY'::"BodyRegion"),
        ('hamstrings', 'LOWER_BODY'::"BodyRegion"),
        ('adductors', 'LOWER_BODY'::"BodyRegion"),
        ('hip-flexors', 'LOWER_BODY'::"BodyRegion"),
        ('calves', 'LOWER_BODY'::"BodyRegion"),
        ('neck', 'UPPER_BODY'::"BodyRegion")
) AS curated_group("slug", "bodyRegion")
WHERE muscle_group."slug" = curated_group."slug"
  AND muscle_group."bodyRegion" IS NULL;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "MuscleGroup"
        WHERE "bodyRegion" IS NULL
    ) THEN
        RAISE EXCEPTION 'Cannot require MuscleGroup.bodyRegion: unclassified muscle groups remain';
    END IF;
END
$$;

-- AlterTable
ALTER TABLE "MuscleGroup" ALTER COLUMN "bodyRegion" SET NOT NULL;
