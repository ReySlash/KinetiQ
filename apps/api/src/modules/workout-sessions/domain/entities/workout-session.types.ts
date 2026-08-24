import type { LoadUnitValue } from '../value-objects/completed-set-performance.vo';
import type { PrescriptionSnapshotAttributes } from '../value-objects/prescription-snapshot.vo';
import type { WorkoutSessionStatusValue } from '../value-objects/workout-session-status.vo';

// Represents a completed set within an exercise performance
export type PrimitiveCompletedSet = {
  id: string;
  exercisePerformanceId: string;
  order: number;
  repetitions: number;
  loadKg: string;
  loadUnit: LoadUnitValue;
  rir: number | null;
  isWarmup: boolean;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

// Attributes for recording a completed set
export type RecordCompletedSetAttributes = {
  repetitions: number;
  load: string;
  loadUnit: LoadUnitValue;
  rir?: number | null;
  isWarmup?: boolean;
  completedAt?: Date;
};

// Attributes for updating a completed set
export type UpdateCompletedSetAttributes = {
  repetitions?: number;
  load?: string;
  loadUnit?: LoadUnitValue;
  rir?: number | null;
  isWarmup?: boolean;
};

// Represents an exercise performance within a workout session
export type PrimitiveExercisePerformance = {
  id: string;
  workoutSessionId: string;
  exerciseId: string;
  sourceRoutineExerciseId: string | null;
  order: number;
  exerciseNameSnapshot: string;
  targetSetCount: number | null;
  targetMinReps: number | null;
  targetMaxReps: number | null;
  targetRir: number | null;
  targetRestSeconds: number | null;
  targetTempo: string | null;
  prescriptionNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedSets: PrimitiveCompletedSet[];
};

// Attributes for creating an exercise performance
export type CreateExercisePerformanceAttributes = {
  exerciseId: string;
  sourceRoutineExerciseId?: string | null;
  exerciseName: string;
  prescription?: PrescriptionSnapshotAttributes | null;
};

// Attributes for adding an exercise to a workout session
export type AddExerciseAttributes = {
  exerciseId: string;
  exerciseName: string;
  isExerciseActive: boolean;
};

// Attributes for a source routine snapshot
export type SourceRoutineSnapshotAttributes = {
  id: string;
  name: string;
  exercises: Array<
    CreateExercisePerformanceAttributes & { sourceRoutineExerciseId: string }
  >;
};

// Represents a workout session
export type PrimitiveWorkoutSession = {
  id: string;
  ownerId: string;
  sourceRoutineId: string | null;
  sourceRoutineNameSnapshot: string | null;
  status: WorkoutSessionStatusValue;
  timezone: string;
  startedAt: Date;
  completedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  exercisePerformances: PrimitiveExercisePerformance[];
};

// Attributes for starting a workout session
export type StartWorkoutSessionAttributes = {
  ownerId: string;
  timezone: string;
  startedAt?: Date;
  sourceRoutine?: SourceRoutineSnapshotAttributes | null;
};
