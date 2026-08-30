import type {
  AdoptedTrainingProgramApplicationStatus,
  ProgramWorkoutOccurrenceApplicationStatus,
} from './adopted-training-program-status.model';

export type AdoptedTrainingProgramDetail = {
  id: string;
  programNameSnapshot: string;
  status: AdoptedTrainingProgramApplicationStatus;
  durationWeeksSnapshot: number;
  startedAt: Date;
  completedAt: Date | null;
  cancelledAt: Date | null;
  totalCount: number;
  completedCount: number;
  skippedCount: number;
  resolvedCount: number;
  progressPercent: number;
  readonly occurrences: readonly ProgramWorkoutOccurrenceDetail[];
  nextPendingOccurrence: ProgramWorkoutOccurrenceDetail | null;
  actions: AdoptedTrainingProgramActions;
};

export type ProgramWorkoutOccurrenceDetail = {
  id: string;
  weekNumber: number;
  dayNumber: number;
  routineNameSnapshot: string;
  programSlotNotesSnapshot: string | null;
  status: ProgramWorkoutOccurrenceApplicationStatus;
  sourceRoutineAvailable: boolean;
  readonly sessionAttemptIds: readonly string[];
  activeSessionId: string | null;
  latestSessionId: string | null;
};

export type AdoptedTrainingProgramActions = {
  canPause: boolean;
  canResume: boolean;
  canCancel: boolean;
  canStartNext: boolean;
  canSkipNext: boolean;
};
