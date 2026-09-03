export type AdoptedTrainingProgramStatus =
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "CANCELLED";

export type ProgramWorkoutOccurrenceStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "SKIPPED";

export type ProgramWorkoutOccurrence = {
  id: string;
  weekNumber: number;
  dayNumber: number;
  routineNameSnapshot: string;
  programSlotNotesSnapshot: string | null;
  status: ProgramWorkoutOccurrenceStatus;
  sourceRoutineAvailable: boolean;
  sessionAttemptIds: string[];
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

export type AdoptedTrainingProgram = {
  id: string;
  programNameSnapshot: string;
  status: AdoptedTrainingProgramStatus;
  durationWeeksSnapshot: number;
  startedAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  totalCount: number;
  completedCount: number;
  skippedCount: number;
  resolvedCount: number;
  progressPercent: number;
  occurrences: ProgramWorkoutOccurrence[];
  nextPendingOccurrence: ProgramWorkoutOccurrence | null;
  actions: AdoptedTrainingProgramActions;
};

export type AdoptTrainingProgramResult = {
  id: string;
  status: "ACTIVE";
  startedAt: string;
};

export type AdoptedTrainingProgramMutation = {
  id: string;
  status: AdoptedTrainingProgramStatus;
  updatedAt: string;
};

export type StartProgramWorkoutResult = {
  workoutSessionId: string;
  occurrenceId: string;
  sessionStatus: "IN_PROGRESS";
  occurrenceStatus: "IN_PROGRESS";
};

export type StartProgramWorkoutInput = {
  timezone: string;
  startedAt?: Date;
};
