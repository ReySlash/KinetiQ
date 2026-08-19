import { RoutineListAuthenticationError } from '../../errors/routine.errors';
import type {
  ListRoutinesInput,
  ListRoutinesQuery,
  RoutineListItem,
} from '../../models/list-routines.model';
import { RoutinesQueryPort } from '../../ports/routines-query.port';

export class ListRoutinesUseCase {
  constructor(private readonly routines: RoutinesQueryPort) {}

  execute(input: ListRoutinesInput = {}): Promise<RoutineListItem[]> {
    const scope = input.scope ?? 'my';
    const queryBase = {
      q: input.q,
      sort: input.sort ?? 'updatedAt:desc',
      limit: input.limit ?? 20,
      offset: input.offset ?? 0,
    } as const;

    if (scope === 'my') {
      if (!input.ownerId) throw new RoutineListAuthenticationError();
      const query: ListRoutinesQuery = {
        ...queryBase,
        scope: 'my',
        ownerId: input.ownerId,
      };
      return this.routines.findAll(query);
    }

    const query: ListRoutinesQuery = { ...queryBase, scope: 'global' };
    return this.routines.findAll(query);
  }
}
