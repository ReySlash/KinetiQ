import type { CreateTrainingProgramInput } from '../models/create-training-program.input';
import { TrainingProgram } from '../../domain/entities/training-program.entity';
import { TrainingProgramsRepository } from '../../domain/repositories/training-programs.repository';

export class CreateTrainingProgramUseCase {
  constructor(
    private readonly trainingProgramsRepository: TrainingProgramsRepository,
  ) {}

  async execute(
    attributes: CreateTrainingProgramInput,
  ): Promise<{ slug: string }> {
    const trainingProgram = TrainingProgram.create(attributes);
    await this.trainingProgramsRepository.create(trainingProgram);
    return { slug: trainingProgram.slug };
  }
}
