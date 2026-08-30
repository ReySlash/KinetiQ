export type AdoptTrainingProgramInput = {
  ownerId: string;
  sourceProgramSlug: string;
};

export type AdoptedTrainingProgramLifecycleInput = {
  ownerId: string;
  adoptedTrainingProgramId: string;
};

export type SkipProgramWorkoutOccurrenceInput =
  AdoptedTrainingProgramLifecycleInput & {
    occurrenceId: string;
  };

export type StartProgramWorkoutOccurrenceInput =
  AdoptedTrainingProgramLifecycleInput & {
    occurrenceId: string;
    timezone: string;
    startedAt?: Date;
  };

export type AdoptedTrainingProgramCommandResult = {
  id: string;
  status: AdoptedTrainingProgramApplicationStatus;
  updatedAt: Date;
};

export type AdoptTrainingProgramResult = {
  id: string;
  status: 'ACTIVE';
  startedAt: Date;
};

export type StartProgramWorkoutOccurrenceResult = {
  workoutSessionId: string;
  occurrenceId: string;
  sessionStatus: 'IN_PROGRESS';
  occurrenceStatus: 'IN_PROGRESS';
};
import type { AdoptedTrainingProgramApplicationStatus } from './adopted-training-program-status.model';
