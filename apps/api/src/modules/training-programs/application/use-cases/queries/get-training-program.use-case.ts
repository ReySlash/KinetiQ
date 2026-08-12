import { TrainingProgramNotFoundError } from '../../errors/training-program.errors';
import type {
  GetTrainingProgramQuery,
  TrainingProgramDetail,
} from '../../models/detail-training-program.model';
import type { TrainingProgramsQueryRepository } from '../../repositories/training-programs-query.repository';

export class GetTrainingProgramUseCase {
  constructor(
    private readonly trainingPrograms: TrainingProgramsQueryRepository,
  ) {}

  async execute(
    input: GetTrainingProgramQuery,
  ): Promise<TrainingProgramDetail> {
    const trainingProgram = await this.trainingPrograms.findBySlug(input);
    if (!trainingProgram) {
      throw new TrainingProgramNotFoundError();
    }
    return trainingProgram;
  }
}
