import type { TrainingProgram } from '../../domain/entities/training-program.entity';
import type { TrainingProgramsRepository } from '../../domain/repositories/training-programs.repository';

export class ListTrainingProgramsUseCase {
  constructor(private readonly trainingPrograms: TrainingProgramsRepository) {}

  execute(): Promise<TrainingProgram[]> {
    return this.trainingPrograms.findAll();
  }
}
