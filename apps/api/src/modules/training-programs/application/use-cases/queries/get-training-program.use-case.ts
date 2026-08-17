import { TrainingProgramNotFoundError } from '../../errors/training-program.errors';
import type {
  GetTrainingProgramQuery,
  TrainingProgramDetail,
} from '../../models/detail-training-program.model';
import type { TrainingProgramsQueryPort } from '../../ports/training-programs-query.port';

export class GetTrainingProgramUseCase {
  constructor(private readonly trainingPrograms: TrainingProgramsQueryPort) {}

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
