import type { TrainingProgram } from '../../domain/entities/training-program.entity';

export abstract class TrainingProgramsCommandRepository {
  abstract create(trainingProgram: TrainingProgram): Promise<void>;
  abstract findOwnedPrivateBySlug(
    slug: string,
    ownerId: string,
  ): Promise<TrainingProgram | null>;
  abstract update(trainingProgram: TrainingProgram): Promise<void>;
}
