import type {
  ForceType,
  Laterality,
  SkillLevel,
} from '../../domain/entities/exercise.types';

export type ListExercisesQuery = {
  search?: string;
  forceType?: ForceType;
  laterality?: Laterality;
  skillLevel?: SkillLevel;
  limit?: number;
  offset?: number;
};

export type ExerciseListItem = {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl: string | null;
  thumbnailStorageKey: string | null;
  imageAltText: string | null;
  muscles: Array<{
    name: string;
    slug: string;
  }>;
};
