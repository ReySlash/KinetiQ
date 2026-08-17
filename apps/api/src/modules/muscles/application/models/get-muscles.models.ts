import { BodyRegion } from '../../domain/entities/muscle.types';

export type MuscleFunctionRole = 'PRIMARY' | 'SECONDARY';

export type MuscleDetails = {
  id: string;
  name: string;
  slug: string;
  description: string;
  bodyRegion: BodyRegion;
  thumbnailUrl: string | null;
  thumbnailStorageKey: string | null;
  imageAltText: string | null;
  sortOrder: number;
  muscleGroup: {
    name: string;
    slug: string;
  } | null;
  exerciseMuscles: {
    name: string;
    slug: string;
    thumbnailUrl: string | null;
    imageAltText: string | null;
  }[];
  functionAssignments: {
    role: MuscleFunctionRole;
    muscleFunction: {
      name: string;
      slug: string;
      description: string | null;
    };
  }[];
};
