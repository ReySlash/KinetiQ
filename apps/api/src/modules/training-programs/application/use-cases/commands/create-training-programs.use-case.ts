import type { CreateTrainingProgramInput } from '../../models/create-training-program.input';
import { TrainingProgram } from '../../../domain/entities/training-program.entity';
import { TrainingProgramsCommandPort } from '../../ports/training-programs-command.port';

export class CreateTrainingProgramUseCase {
  constructor(
    private readonly trainingProgramsPort: TrainingProgramsCommandPort,
  ) {}

  async execute(
    attributes: CreateTrainingProgramInput,
  ): Promise<{ slug: string }> {
    const trainingProgram = TrainingProgram.create(attributes);
    await this.trainingProgramsPort.create(trainingProgram);
    return { slug: trainingProgram.slug };
  }
}
