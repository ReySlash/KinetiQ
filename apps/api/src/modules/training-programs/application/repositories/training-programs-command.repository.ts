import type { TrainingProgram } from '../../domain/entities/training-program.entity';

export abstract class TrainingProgramsCommandRepository {
  abstract create(trainingProgram: TrainingProgram): Promise<void>;
}
