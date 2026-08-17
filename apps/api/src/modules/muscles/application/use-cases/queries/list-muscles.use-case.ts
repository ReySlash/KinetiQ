import type {
  ListMusclesQueryParams,
  MusclesListItem,
} from '../../models/list-muscles.models';
import type { MusclesQueriesPort } from '../../ports/muscles-queries.port';

export class ListMusclesUseCase {
  constructor(private readonly muscles: MusclesQueriesPort) {}

  execute(input: ListMusclesQueryParams = {}): Promise<MusclesListItem[]> {
    return this.muscles.list({
      limit: input.limit ?? 20,
      offset: input.offset ?? 0,
    });
  }
}
