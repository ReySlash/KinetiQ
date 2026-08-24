-- Prisma does not currently express partial unique indexes in schema.prisma.
-- Keep the one-active-workout invariant enforced at the PostgreSQL boundary.
CREATE UNIQUE INDEX "WorkoutSession_one_in_progress_per_owner_idx"
ON "WorkoutSession" ("ownerId")
WHERE "status" = 'IN_PROGRESS';
