import type {
  StartProgramWorkoutOccurrenceInput,
  StartProgramWorkoutOccurrenceResult,
} from '../models/adopted-training-program-command.input';

export abstract class AdoptedTrainingProgramExecutionPort {
  abstract startProgramWorkout(
    input: StartProgramWorkoutOccurrenceInput,
  ): Promise<StartProgramWorkoutOccurrenceResult>;
}
