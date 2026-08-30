import { ExistingUuid } from '../../../shared/domain/value-objects/existing-uuid.vo';
import type {
  AdoptedTrainingProgramCommandResult,
  SkipProgramWorkoutOccurrenceInput,
} from '../models/adopted-training-program-command.input';
import type { AdoptedTrainingProgramsCommandPort } from '../ports/adopted-training-programs-command.port';
import { normalizeLifecycleInput } from './normalize-adopted-training-program-input';

export class SkipProgramWorkoutOccurrenceUseCase {
  constructor(private readonly commands: AdoptedTrainingProgramsCommandPort) {}

  execute(
    input: SkipProgramWorkoutOccurrenceInput,
  ): Promise<AdoptedTrainingProgramCommandResult> {
    return this.commands.skipOccurrence({
      ...normalizeLifecycleInput(input),
      occurrenceId: ExistingUuid.create(input.occurrenceId).value,
    });
  }
}
