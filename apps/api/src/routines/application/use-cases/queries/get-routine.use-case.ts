import { RoutineNotFoundError } from '../../errors/routine.errors';
import type {
  RoutineDetail,
  GetRoutineQuery,
} from '../../models/detail-routine.model';
import { RoutinesQueryPort } from '../../ports/routines-query.port';

export class GetRoutineUseCase {
  constructor(private readonly routines: RoutinesQueryPort) {}

  async execute(input: GetRoutineQuery): Promise<RoutineDetail> {
    const routine = await this.routines.findBySlug(input);
    if (!routine) throw new RoutineNotFoundError();
    return routine;
  }
}
