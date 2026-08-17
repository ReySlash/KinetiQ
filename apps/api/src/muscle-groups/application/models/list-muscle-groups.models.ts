import type { BodyRegion } from '../../domain/entities/muscle-group.types';

export type MuscleGroupListMuscle = {
  name: string;
  bodyRegion: BodyRegion;
};

export type MuscleGroupListItem = {
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  thumbnailUrl: string | null;
  thumbnailStorageKey: string | null;
  imageAltText: string | null;
  muscles: MuscleGroupListMuscle[];
};
