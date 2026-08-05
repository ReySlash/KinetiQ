ALTER TYPE "RoutineVisibility" ADD VALUE 'GLOBAL';

ALTER TABLE "Routine"
ADD COLUMN "slug" TEXT;

UPDATE "Routine"
SET "slug" = COALESCE(
  NULLIF(
    TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER("name"), '[^a-z0-9]+', '-', 'g')),
    ''
  ),
  'routine'
) || '-' || LEFT(REPLACE("id"::TEXT, '-', ''), 8);

ALTER TABLE "Routine"
ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "Routine_slug_key" ON "Routine"("slug");
CREATE INDEX "Routine_visibility_updatedAt_idx" ON "Routine"("visibility", "updatedAt");
