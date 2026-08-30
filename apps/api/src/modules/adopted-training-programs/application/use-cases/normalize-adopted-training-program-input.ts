import { ExistingUuid } from '../../../shared/domain/value-objects/existing-uuid.vo';
import type { AdoptedTrainingProgramLifecycleInput } from '../models/adopted-training-program-command.input';

export function normalizeLifecycleInput(
  input: AdoptedTrainingProgramLifecycleInput,
): AdoptedTrainingProgramLifecycleInput {
  return {
    ownerId: ExistingUuid.create(input.ownerId).value,
    adoptedTrainingProgramId: ExistingUuid.create(
      input.adoptedTrainingProgramId,
    ).value,
  };
}
