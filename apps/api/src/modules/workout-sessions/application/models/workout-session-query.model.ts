import type { WorkoutSessionStatusValue } from '../../domain/value-objects/workout-session-status.vo';

export type WorkoutSessionListQuery = {
  ownerId: string;
  q?: string;
  status?: WorkoutSessionStatusValue;
  from?: Date;
  to?: Date;
  limit: number;
  offset: number;
};

export type GetWorkoutSessionQuery = {
  ownerId: string;
  workoutSessionId: string;
};

export type GetExerciseHistoryQuery = {
  ownerId: string;
  exerciseId: string;
  from?: Date;
  to?: Date;
  limit: number;
  offset: number;
};

export type CompletedSetHistoryItem = {
  id: string;
  order: number;
  repetitions: number;
  loadKg: string;
  loadUnit: 'KG' | 'LB';
  rir: number | null;
  isWarmup: boolean;
  completedAt: Date;
};

export type ExercisePerformanceHistoryItem = {
  id: string;
  exerciseId: string;
  exerciseNameSnapshot: string;
  order: number;
  targetSetCount: number | null;
  targetMinReps: number | null;
  targetMaxReps: number | null;
  targetRir: number | null;
  targetRestSeconds: number | null;
  targetTempo: string | null;
  prescriptionNotes: string | null;
  completedSets: CompletedSetHistoryItem[];
};

export type WorkoutSessionDetail = {
  id: string;
  status: WorkoutSessionStatusValue;
  sourceRoutineId: string | null;
  sourceRoutineNameSnapshot: string | null;
  timezone: string;
  startedAt: Date;
  completedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  performances: ExercisePerformanceHistoryItem[];
};

export type WorkoutSessionListItem = Pick<
  WorkoutSessionDetail,
  | 'id'
  | 'status'
  | 'sourceRoutineNameSnapshot'
  | 'timezone'
  | 'startedAt'
  | 'completedAt'
  | 'cancelledAt'
  | 'updatedAt'
> & { completedSetCount: number };

export type ExerciseHistoryItem = {
  workoutSessionId: string;
  sessionStatus: WorkoutSessionStatusValue;
  sessionStartedAt: Date;
  exercisePerformanceId: string;
  exerciseNameSnapshot: string;
  prescription: Pick<
    ExercisePerformanceHistoryItem,
    | 'targetSetCount'
    | 'targetMinReps'
    | 'targetMaxReps'
    | 'targetRir'
    | 'targetRestSeconds'
    | 'targetTempo'
    | 'prescriptionNotes'
  >;
  completedSets: CompletedSetHistoryItem[];
};
