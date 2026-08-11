import { TrainingProgramListAuthenticationError } from '../../errors/training-program.errors';
import type {
  ListTrainingProgramsInput,
  TrainingProgramListItem,
} from '../../models/list-training-programs.model';
import type { TrainingProgramsQueryRepository } from '../../repositories/training-programs-query.repository';

export class ListTrainingProgramsUseCase {
  constructor(
    private readonly trainingPrograms: TrainingProgramsQueryRepository,
  ) {}

  execute(
    input: ListTrainingProgramsInput,
  ): Promise<TrainingProgramListItem[]> {
    const scope = input.scope ?? 'my';
    const options = {
      ...(input.q ? { q: input.q } : {}),
      sort: input.sort ?? 'updatedAt:desc',
      limit: input.limit ?? 20,
      offset: input.offset ?? 0,
    } as const;

    if (scope === 'my') {
      const principal = input.principal;
      if (!principal) {
        throw new TrainingProgramListAuthenticationError();
      }
      return this.trainingPrograms.findAll({
        ...options,
        scope: 'my',
        ownerId: principal.userId,
      });
    }

    return this.trainingPrograms.findAll({
      ...options,
      scope: 'global',
    });
  }
}
