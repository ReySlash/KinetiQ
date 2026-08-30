import { ExistingUuid } from '../../../shared/domain/value-objects/existing-uuid.vo';
import type { AdoptedTrainingProgramDetail } from '../models/adopted-training-program-detail.model';
import type { AdoptedTrainingProgramsQueryPort } from '../ports/adopted-training-programs-query.port';

export class GetNonTerminalAdoptedTrainingProgramUseCase {
  constructor(private readonly queries: AdoptedTrainingProgramsQueryPort) {}

  execute(ownerId: string): Promise<AdoptedTrainingProgramDetail | null> {
    return this.queries.findNonTerminalByOwner(
      ExistingUuid.create(ownerId).value,
    );
  }
}
