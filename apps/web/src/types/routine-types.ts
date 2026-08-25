export type RoutineListItem = {
  slug: string;
  name: string;
  description: string | null;
  visibility: "PRIVATE" | "GLOBAL";
  updatedAt: string;
  exerciseCount: number;
};

export type RoutineExerciseInput = {
  exerciseSlug: string;
  sets: number;
  minReps: number;
  maxReps: number;
  targetRir?: number | null;
  restSeconds?: number | null;
  tempo?: string | null;
  notes?: string | null;
};

export type RoutineCreateInput = {
  name: string;
  description?: string | null;
  exercises: RoutineExerciseInput[];
};

export type RoutineExercise = RoutineExerciseInput & {
  id: string;
  order: number;
  exercise: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    archivedAt: string | null;
  };
};

export type RoutineDetail = {
  slug: string;
  name: string;
  description: string | null;
  visibility: "PRIVATE" | "GLOBAL";
  createdAt: string;
  updatedAt: string;
  exercises: RoutineExercise[];
};

export type ExerciseOption = {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl: string | null;
  muscles: { name: string; slug: string }[];
};
