import { ExistingUuid } from '../../../shared/domain/value-objects/existing-uuid.vo';
import type {
  AdoptTrainingProgramInput,
  AdoptTrainingProgramResult,
} from '../models/adopted-training-program-command.input';
import type { AdoptedTrainingProgramsCommandPort } from '../ports/adopted-training-programs-command.port';

export class AdoptTrainingProgramUseCase {
  constructor(private readonly commands: AdoptedTrainingProgramsCommandPort) {}

  async execute(
    input: AdoptTrainingProgramInput,
  ): Promise<AdoptTrainingProgramResult> {
    const ownerId = ExistingUuid.create(input.ownerId).value;
    return this.commands.adopt({
      ownerId,
      sourceProgramSlug: input.sourceProgramSlug.trim().toLowerCase(),
    });
  }
}
