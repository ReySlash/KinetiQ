import { TrainingProgramListAuthenticationError } from '../errors/training-program.errors';
import type {
  ListTrainingProgramsInput,
  TrainingProgramListItem,
} from '../models/list-training-programs.model';
import type { TrainingProgramsQueryRepository } from '../repositories/training-programs-query.repository';

export class ListTrainingProgramsUseCase {
  constructor(
    private readonly trainingPrograms: TrainingProgramsQueryRepository,
  ) {}

  execute(
    input: ListTrainingProgramsInput,
  ): Promise<TrainingProgramListItem[]> {
    const scope = input.scope ?? 'my';
    if (scope === 'my' && !input.principal) {
      throw new TrainingProgramListAuthenticationError();
    }
    const ownerId = scope === 'my' ? input.principal?.userId : undefined;

    return this.trainingPrograms.findAll({
      scope,
      ...(ownerId ? { ownerId } : {}),
      ...(input.q ? { q: input.q } : {}),
      sort: input.sort ?? 'updatedAt:desc',
      limit: input.limit ?? 20,
      offset: input.offset ?? 0,
    });
  }
}
