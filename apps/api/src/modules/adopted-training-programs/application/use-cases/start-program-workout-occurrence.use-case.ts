import { ExistingUuid } from '../../../shared/domain/value-objects/existing-uuid.vo';
import type {
  StartProgramWorkoutOccurrenceInput,
  StartProgramWorkoutOccurrenceResult,
} from '../models/adopted-training-program-command.input';
import type { AdoptedTrainingProgramExecutionPort } from '../ports/adopted-training-program-execution.port';

export class StartProgramWorkoutOccurrenceUseCase {
  constructor(
    private readonly execution: AdoptedTrainingProgramExecutionPort,
  ) {}

  execute(
    input: StartProgramWorkoutOccurrenceInput,
  ): Promise<StartProgramWorkoutOccurrenceResult> {
    return this.execution.startProgramWorkout({
      ...input,
      ownerId: ExistingUuid.create(input.ownerId).value,
      adoptedTrainingProgramId: ExistingUuid.create(
        input.adoptedTrainingProgramId,
      ).value,
      occurrenceId: ExistingUuid.create(input.occurrenceId).value,
    });
  }
}
