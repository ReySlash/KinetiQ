import type {
  AdoptedTrainingProgramCommandResult,
  AdoptedTrainingProgramLifecycleInput,
} from '../models/adopted-training-program-command.input';
import type { AdoptedTrainingProgramsCommandPort } from '../ports/adopted-training-programs-command.port';
import { normalizeLifecycleInput } from './normalize-adopted-training-program-input';

export class CancelAdoptedTrainingProgramUseCase {
  constructor(private readonly commands: AdoptedTrainingProgramsCommandPort) {}

  execute(
    input: AdoptedTrainingProgramLifecycleInput,
  ): Promise<AdoptedTrainingProgramCommandResult> {
    return this.commands.cancel(normalizeLifecycleInput(input));
  }
}
