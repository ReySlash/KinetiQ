export type BodyRegion =
  'UPPER_BODY' | 'LOWER_BODY' | 'CORE' | 'FULL_BODY' | 'OTHER';

export type CreateMuscleGroupAttributes = {
  name: string;
  slug?: string;
  description: string;
  bodyRegion: BodyRegion;
  thumbnailUrl?: string;
  thumbnailStorageKey?: string;
  imageAltText?: string;
  sortOrder?: number;
};

export type PrimitiveMuscleGroup = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  bodyRegion: BodyRegion;
  thumbnailUrl: string | null;
  thumbnailStorageKey: string | null;
  imageAltText: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};
