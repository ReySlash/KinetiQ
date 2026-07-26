export type MuscleGroup = {
  name: string;
  slug: string;
  description: string;
  thumbnailUrl: string | null;
  thumbnailStorageKey: string | null;
  imageAltText: string | null;
  sortOrder: number;
  bodyRegion: string;
  muscles: {
    name: string;
    bodyRegion: string;
  }[];
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
  muscleGroup?: MuscleGroup;
  functionAssignments: Array<{
    role: string;
    muscleFunction: {
      name: string;
    };
  }>;
};
