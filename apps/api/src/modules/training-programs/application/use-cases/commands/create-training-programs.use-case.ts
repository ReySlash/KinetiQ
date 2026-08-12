import type { CreateTrainingProgramInput } from '../../models/create-training-program.input';
import { TrainingProgram } from '../../../domain/entities/training-program.entity';
import { TrainingProgramsCommandRepository } from '../../repositories/training-programs-command.repository';

export class CreateTrainingProgramUseCase {
  constructor(
    private readonly trainingProgramsRepository: TrainingProgramsCommandRepository,
  ) {}

  async execute(
    attributes: CreateTrainingProgramInput,
  ): Promise<{ slug: string }> {
    const trainingProgram = TrainingProgram.create(attributes);
    await this.trainingProgramsRepository.create(trainingProgram);
    return { slug: trainingProgram.slug };
  }
}
