import { ExerciseMuscleSummary } from "./exercise-types";

export type BodyRegion =
  | "UPPER_BODY"
  | "LOWER_BODY"
  | "CORE"
  | "FULL_BODY"
  | "OTHER";

export type MuscleRole = "PRIMARY" | "SECONDARY" | "STABILIZER";

export type MuscleFunction = {
  name: string;
  slug: string;
  description: string | null;
};

export type MuscleFunctionAssignment = {
  role: MuscleRole;
  muscleFunction: MuscleFunction;
};

export type MuscleGroup = {
  name: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  thumbnailStorageKey: string | null;
  imageAltText: string | null;
  sortOrder: number;
  muscles: {
    name: string;
    bodyRegion: BodyRegion;
  }[];
};

export type MuscleGroupDetailsMuscle = {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl: string | null;
  thumbnailStorageKey: string | null;
  imageAltText: string | null;
  functionAssignments: MuscleFunctionAssignment[];
};

export type MuscleGroupDetails = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  thumbnailStorageKey: string | null;
  imageAltText: string | null;
  bodyRegion: BodyRegion;
  muscles: MuscleGroupDetailsMuscle[];
};

export type Muscle = {
  id: string;
  name: string;
  slug: string;
  description: string;
  bodyRegion: BodyRegion;
  thumbnailUrl: string | null;
  thumbnailStorageKey: string | null;
  imageAltText: string | null;
  sortOrder: number;
  exerciseMuscles: ExerciseMuscleSummary[];
  muscleGroup: {
    name: string;
    slug: string;
  } | null;
  functionAssignments: MuscleFunctionAssignment[];
};
