import { Exercise } from '../../domain/entities/exercise.entity';

export abstract class ExercisesCommandPort {
  abstract findById(id: string): Promise<Exercise | null>;
  abstract create(exercise: Exercise): Promise<void>;
  abstract update(exercise: Exercise): Promise<void>;
  abstract archive(exercise: Exercise): Promise<void>;
}
