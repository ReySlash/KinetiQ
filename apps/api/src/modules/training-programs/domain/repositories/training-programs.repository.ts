import type { TrainingProgram } from '../entities/training-program.entity';

export abstract class TrainingProgramsRepository {
  abstract findAll(): Promise<TrainingProgram[]>;
  abstract create(trainingProgram: TrainingProgram): Promise<void>;
}
