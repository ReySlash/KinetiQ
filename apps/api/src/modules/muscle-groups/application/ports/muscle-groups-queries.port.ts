import type { MuscleGroupDetail } from '../models/detail-muscle-group.models';
import type { MuscleGroupListItem } from '../models/list-muscle-groups.models';

export abstract class MuscleGroupsQueriesPort {
  abstract findAll(): Promise<MuscleGroupListItem[]>;
  abstract findBySlug(slug: string): Promise<MuscleGroupDetail | null>;
}
