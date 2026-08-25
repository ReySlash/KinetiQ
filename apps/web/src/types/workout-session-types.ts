export type WorkoutSessionStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type LoadUnit = "KG" | "LB";

export type CompletedSet = {
  id: string;
  order: number;
  repetitions: number;
  loadKg: string;
  loadUnit: LoadUnit;
  rir: number | null;
  isWarmup: boolean;
  completedAt: string;
};

export type ExercisePerformance = {
  id: string;
  exerciseId?: string;
  exerciseNameSnapshot: string;
  order: number;
  targetSetCount: number | null;
  targetMinReps: number | null;
  targetMaxReps: number | null;
  targetRir: number | null;
  targetRestSeconds?: number | null;
  targetTempo?: string | null;
  prescriptionNotes?: string | null;
  completedSets: CompletedSet[];
};

export type WorkoutSession = {
  id: string;
  status: WorkoutSessionStatus;
  sourceRoutineId?: string | null;
  sourceRoutineNameSnapshot?: string | null;
  timezone: string;
  startedAt: string;
  completedAt?: string | null;
  cancelledAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  performances: ExercisePerformance[];
};

export type WorkoutSessionListItem = {
  id: string;
  status: WorkoutSessionStatus;
  updatedAt: string;
  sourceRoutineNameSnapshot: string | null;
  timezone: string;
  startedAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  completedSetCount: number;
};

export type WorkoutSessionMutation = {
  id: string;
  status: WorkoutSessionStatus;
  updatedAt?: string;
  version?: number;
};

export type WorkoutSessionFilters = {
  status?: WorkoutSessionStatus;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
};

export type StartWorkoutInput = {
  timezone: string;
  routineSlug?: string;
  startedAt?: Date;
};

export type RecordWorkoutSetInput = {
  repetitions: number;
  load: string;
  loadUnit: LoadUnit;
  rir?: number | null;
  isWarmup?: boolean;
  completedAt?: Date;
};

export type UpdateWorkoutSetInput = Partial<
  Omit<RecordWorkoutSetInput, "completedAt">
>;
