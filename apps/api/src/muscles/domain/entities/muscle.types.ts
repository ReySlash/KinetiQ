export type MuscleBodyRegion =
  'UPPER_BODY' | 'LOWER_BODY' | 'CORE' | 'FULL_BODY' | 'OTHER';

export type CreateMuscleAttributes = {
  name: string;
  slug?: string;
  description: string;
  bodyRegion: MuscleBodyRegion;
  muscleGroupId?: string;
  parentId?: string;
  thumbnailUrl?: string;
  thumbnailStorageKey?: string;
  imageAltText?: string;
  isActive?: boolean;
  sortOrder?: number;
};

export type PrimitiveMuscle = {
  id: string;
  name: string;
  slug: string;
  description: string;
  bodyRegion: MuscleBodyRegion;
  muscleGroupId: string | null;
  parentId: string | null;
  thumbnailUrl: string | null;
  thumbnailStorageKey: string | null;
  imageAltText: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};
