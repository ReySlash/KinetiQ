import type { MuscleGroupListItem } from '../../models/list-muscle-groups.models';
import type { MuscleGroupsQueriesPort } from '../../ports/muscle-groups-queries.port';

export class ListMuscleGroupsUseCase {
  constructor(private readonly muscleGroups: MuscleGroupsQueriesPort) {}

  execute(): Promise<MuscleGroupListItem[]> {
    return this.muscleGroups.findAll();
  }
}
