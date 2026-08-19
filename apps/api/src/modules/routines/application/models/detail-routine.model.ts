export type RoutineDetailExercise = {
  id: string;
  exerciseSlug: string;
  order: number;
  sets: number;
  minReps: number;
  maxReps: number;
  targetRir: number | null;
  restSeconds: number | null;
  tempo: string | null;
  notes: string | null;
  exercise: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    archivedAt: Date | null;
  };
};

export type RoutineDetail = {
  slug: string;
  name: string;
  description: string | null;
  visibility: 'PRIVATE' | 'GLOBAL';
  createdAt: Date;
  updatedAt: Date;
  exercises: RoutineDetailExercise[];
};

export type GetRoutineQuery = {
  slug: string;
  ownerId?: string;
};
