import type { AdoptedTrainingProgramStatusValue } from './value-objects/adopted-training-program-status.vo';
import type {
  CreateProgramWorkoutOccurrenceAttributes,
  PrimitiveProgramWorkoutOccurrence,
} from './program-workout-occurrence.types';

export type CreateAdoptedTrainingProgramAttributes = {
  ownerId: string;
  sourceTrainingProgramId?: string | null;
  programNameSnapshot: string;
  durationWeeksSnapshot: number;
  startedAt: Date;
  occurrences: readonly CreateProgramWorkoutOccurrenceAttributes[];
};

export type PrimitiveAdoptedTrainingProgram = {
  id: string;
  ownerId: string;
  sourceTrainingProgramId: string | null;
  programNameSnapshot: string;
  durationWeeksSnapshot: number;
  status: AdoptedTrainingProgramStatusValue;
  startedAt: Date;
  completedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  occurrences: PrimitiveProgramWorkoutOccurrence[];
};
