import type { TrainingProgram } from '../../domain/entities/training-program.entity';

export abstract class TrainingProgramsRepository {
  abstract create(trainingProgram: TrainingProgram): Promise<void>;
}
