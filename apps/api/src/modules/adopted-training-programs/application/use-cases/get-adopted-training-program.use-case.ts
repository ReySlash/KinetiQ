import { ExistingUuid } from '../../../shared/domain/value-objects/existing-uuid.vo';
import { AdoptedTrainingProgramNotFoundError } from '../errors/adopted-training-program.errors';
import type { AdoptedTrainingProgramDetail } from '../models/adopted-training-program-detail.model';
import type { AdoptedTrainingProgramsQueryPort } from '../ports/adopted-training-programs-query.port';

export class GetAdoptedTrainingProgramUseCase {
  constructor(private readonly queries: AdoptedTrainingProgramsQueryPort) {}

  async execute(
    adoptedTrainingProgramId: string,
    ownerId: string,
  ): Promise<AdoptedTrainingProgramDetail> {
    const detail = await this.queries.findOwnedDetailById(
      ExistingUuid.create(adoptedTrainingProgramId).value,
      ExistingUuid.create(ownerId).value,
    );
    if (!detail) {
      throw new AdoptedTrainingProgramNotFoundError();
    }
    return detail;
  }
}
