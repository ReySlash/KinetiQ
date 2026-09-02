import type { AdoptedTrainingProgram } from '../../domain/adopted-training-program.aggregate';
import type {
  AdoptTrainingProgramInput,
  AdoptTrainingProgramResult,
  AdoptedTrainingProgramCommandResult,
  AdoptedTrainingProgramLifecycleInput,
  SkipProgramWorkoutOccurrenceInput,
} from '../models/adopted-training-program-command.input';

export abstract class AdoptedTrainingProgramsCommandPort {
  /** Resolves the source and persists the adopted program atomically. */
  abstract adopt(
    input: AdoptTrainingProgramInput,
  ): Promise<AdoptTrainingProgramResult>;
  /** Implementations must enforce one non-terminal program per owner atomically. */
  abstract create(program: AdoptedTrainingProgram): Promise<void>;
  /** Atomically pauses an owned ACTIVE program when its state is unchanged. */
  abstract pause(
    input: AdoptedTrainingProgramLifecycleInput,
  ): Promise<AdoptedTrainingProgramCommandResult>;
  /** Atomically resumes an owned PAUSED program when its state is unchanged. */
  abstract resume(
    input: AdoptedTrainingProgramLifecycleInput,
  ): Promise<AdoptedTrainingProgramCommandResult>;
  /** Atomically cancels an owned non-terminal program without an active occurrence. */
  abstract cancel(
    input: AdoptedTrainingProgramLifecycleInput,
  ): Promise<AdoptedTrainingProgramCommandResult>;
  /** Atomically skips only the owned program's next pending occurrence. */
  abstract skipOccurrence(
    input: SkipProgramWorkoutOccurrenceInput,
  ): Promise<AdoptedTrainingProgramCommandResult>;
}
