export type MuscleGroup = {
  id: string;
  name: string;
  slug: string;
  description: string;
  thumbnailUrl: string | null;
  thumbnailStorageKey: string | null;
  imageAltText: string | null;
  sortOrder: number;
};

export type Muscle = {
  id: string;
  name: string;
  slug: string;
  description: string;
  bodyRegion: string;
  thumbnailUrl: string | null;
  thumbnailStorageKey: string | null;
  imageAltText: string | null;
  sortOrder: number;
};
