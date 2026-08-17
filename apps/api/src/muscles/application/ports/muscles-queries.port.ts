import { MuscleDetails } from '../models/get-muscles.models';
import {
  ListMusclesQueryParams,
  MusclesListItem,
} from '../models/list-muscles.models';

export abstract class MusclesQueriesPort {
  abstract findBySlug(slug: string): Promise<MuscleDetails | null>;
  abstract list(params: ListMusclesQueryParams): Promise<MusclesListItem[]>;
}
