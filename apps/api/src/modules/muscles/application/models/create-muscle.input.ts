import type { BodyRegion } from '../../domain/entities/muscle.types';

export type CreateMuscleInput = {
  name: string;
  slug?: string;
  description: string;
  bodyRegion: BodyRegion;
  muscleGroupId?: string;
  parentId?: string;
  thumbnailUrl?: string;
  thumbnailStorageKey?: string;
  imageAltText?: string;
  sortOrder?: number;
};
