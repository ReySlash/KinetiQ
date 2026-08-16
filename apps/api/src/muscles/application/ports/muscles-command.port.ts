import { Muscle } from '../../domain/entities/muscle.entity';
import type { UpdateMuscleInput } from '../models/update-muscle.input';

export abstract class MusclesCommandRepository {
  abstract create(muscle: Muscle): Promise<void>;
  abstract updateBySlug(slug: string, input: UpdateMuscleInput): Promise<void>;
  abstract deactivateById(id: string): Promise<void>;
}
