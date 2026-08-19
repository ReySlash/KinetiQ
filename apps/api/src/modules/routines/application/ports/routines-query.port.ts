import type {
  RoutineDetail,
  GetRoutineQuery,
} from '../models/detail-routine.model';
import type {
  ListRoutinesQuery,
  RoutineListItem,
} from '../models/list-routines.model';

export abstract class RoutinesQueryPort {
  abstract findAll(query: ListRoutinesQuery): Promise<RoutineListItem[]>;
  abstract findBySlug(query: GetRoutineQuery): Promise<RoutineDetail | null>;
}
