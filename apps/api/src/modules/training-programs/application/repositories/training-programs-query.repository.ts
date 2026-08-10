import type {
  ListTrainingProgramsQuery,
  TrainingProgramListItem,
} from '../models/list-training-programs.model';

export abstract class TrainingProgramsQueryRepository {
  abstract findAll(
    query: ListTrainingProgramsQuery,
  ): Promise<TrainingProgramListItem[]>;
}
