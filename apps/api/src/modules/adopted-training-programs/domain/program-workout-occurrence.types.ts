export type CreateProgramWorkoutOccurrenceAttributes = {
  sourceTrainingProgramRoutineId?: string | null;
  sourceRoutineId?: string | null;
  weekNumber: number;
  dayNumber: number;
  routineNameSnapshot: string;
  programSlotNotesSnapshot?: string | null;
};

export type PrimitiveProgramWorkoutOccurrence = {
  id: string;
  adoptedTrainingProgramId: string;
  sourceTrainingProgramRoutineId: string | null;
  sourceRoutineId: string | null;
  weekNumber: number;
  dayNumber: number;
  routineNameSnapshot: string;
  programSlotNotesSnapshot: string | null;
  status: ProgramWorkoutOccurrenceStatusValue;
  createdAt: Date;
  updatedAt: Date;
};
import type { ProgramWorkoutOccurrenceStatusValue } from './value-objects/program-workout-occurrence-status.vo';
