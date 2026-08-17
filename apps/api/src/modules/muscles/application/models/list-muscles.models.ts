import { BodyRegion } from '../../domain/entities/muscle.types';

export type ListMusclesQueryParams = {
  limit?: number;
  offset?: number;
};

export type MusclesListItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  bodyRegion: BodyRegion;
  thumbnailUrl: string | null;
  thumbnailStorageKey: string | null;
  imageAltText: string | null;
  sortOrder: number;
};
