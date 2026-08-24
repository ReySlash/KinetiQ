import type { SourceRoutineSnapshotAttributes } from '../../domain/entities/workout-session.types';

export abstract class WorkoutSessionSourcesPort {
  abstract findRoutineSnapshot(
    slug: string,
    ownerId: string,
  ): Promise<SourceRoutineSnapshotAttributes | null>;

  abstract findActiveExercise(
    exerciseId: string,
  ): Promise<{ id: string; name: string } | null>;
}
