import type {
  RecordCompletedSetAttributes,
  UpdateCompletedSetAttributes,
} from '../../domain/entities/workout-session.types';

export type StartWorkoutSessionInput = {
  ownerId: string;
  timezone: string;
  routineSlug?: string;
  startedAt?: Date;
};

export type AddWorkoutExerciseInput = {
  ownerId: string;
  workoutSessionId: string;
  exerciseId: string;
};

export type RemoveWorkoutExerciseInput = {
  ownerId: string;
  workoutSessionId: string;
  exercisePerformanceId: string;
};

export type RecordWorkoutSetInput = {
  ownerId: string;
  workoutSessionId: string;
  exercisePerformanceId: string;
} & RecordCompletedSetAttributes;

export type UpdateWorkoutSetInput = {
  ownerId: string;
  workoutSessionId: string;
  exercisePerformanceId: string;
  completedSetId: string;
} & UpdateCompletedSetAttributes;

export type DeleteWorkoutSetInput = {
  ownerId: string;
  workoutSessionId: string;
  exercisePerformanceId: string;
  completedSetId: string;
};

export type CompleteWorkoutSessionInput = {
  ownerId: string;
  workoutSessionId: string;
  completedAt?: Date;
};

export type CancelWorkoutSessionInput = {
  ownerId: string;
  workoutSessionId: string;
  cancelledAt?: Date;
};

export type WorkoutSessionCommandResult = {
  id: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  updatedAt: Date;
};
