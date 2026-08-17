import { MuscleGroupNotFoundError } from '../../errors/muscle-group.errors';
import type { MuscleGroupDetail } from '../../models/detail-muscle-group.models';
import type { MuscleGroupsQueriesPort } from '../../ports/muscle-groups-queries.port';

export class GetMuscleGroupUseCase {
  constructor(private readonly muscleGroups: MuscleGroupsQueriesPort) {}

  async execute(slug: string): Promise<MuscleGroupDetail> {
    const muscleGroup = await this.muscleGroups.findBySlug(slug);
    if (!muscleGroup) {
      throw new MuscleGroupNotFoundError();
    }

    return muscleGroup;
  }
}
