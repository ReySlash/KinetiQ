import type { BodyRegion } from '../../domain/entities/muscle.types';

export type UpdateMuscleInput = {
  name?: string;
  description?: string;
  bodyRegion?: BodyRegion;
  muscleGroupId?: string | null;
  parentId?: string | null;
  thumbnailUrl?: string | null;
  thumbnailStorageKey?: string | null;
  imageAltText?: string | null;
  sortOrder?: number;
};
