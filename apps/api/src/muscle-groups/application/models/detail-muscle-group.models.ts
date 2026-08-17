import type { BodyRegion } from '../../domain/entities/muscle-group.types';

export type MuscleGroupDetailFunctionAssignment = {
  role: 'PRIMARY' | 'SECONDARY' | 'STABILIZER';
  muscleFunction: {
    name: string;
  };
};

export type MuscleGroupDetailMuscle = {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl: string | null;
  thumbnailStorageKey: string | null;
  imageAltText: string | null;
  functionAssignments: MuscleGroupDetailFunctionAssignment[];
};

export type MuscleGroupDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  thumbnailStorageKey: string | null;
  imageAltText: string | null;
  bodyRegion: BodyRegion;
  muscles: MuscleGroupDetailMuscle[];
};
