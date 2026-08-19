import type { RoutineVisibilityValue } from '../value-objects/routine-visibility.vo';

export type RoutineExerciseAttributes = {
  exerciseSlug: string;
  sets: number;
  minReps: number;
  maxReps: number;
  targetRir?: number | null;
  restSeconds?: number | null;
  tempo?: string | null;
  notes?: string | null;
};

export type PrimitiveRoutineExercise = {
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
};

export type CreateRoutineAttributes = {
  ownerId: string;
  name: string;
  description?: string | null;
  visibility?: RoutineVisibilityValue;
  exercises: RoutineExerciseAttributes[];
};

export type UpdateRoutineAttributes = {
  name?: string;
  description?: string | null;
  exercises?: RoutineExerciseAttributes[];
};

export type PrimitiveRoutine = {
  id: string;
  ownerId: string;
  slug: string;
  name: string;
  description: string | null;
  visibility: RoutineVisibilityValue;
  createdAt: Date;
  updatedAt: Date;
  exercises: PrimitiveRoutineExercise[];
};
