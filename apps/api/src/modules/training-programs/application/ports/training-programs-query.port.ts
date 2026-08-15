import type {
  GetTrainingProgramQuery,
  TrainingProgramDetail,
} from '../models/detail-training-program.model';
import type {
  ListTrainingProgramsQuery,
  TrainingProgramListItem,
} from '../models/list-training-programs.model';

export abstract class TrainingProgramsQueryRepository {
  abstract findAll(
    query: ListTrainingProgramsQuery,
  ): Promise<TrainingProgramListItem[]>;

  abstract findBySlug(
    query: GetTrainingProgramQuery,
  ): Promise<TrainingProgramDetail | null>;
}
