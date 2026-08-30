import type { AdoptedTrainingProgramDetail } from '../models/adopted-training-program-detail.model';

export abstract class AdoptedTrainingProgramsQueryPort {
  abstract findNonTerminalByOwner(
    ownerId: string,
  ): Promise<AdoptedTrainingProgramDetail | null>;

  abstract findOwnedDetailById(
    adoptedTrainingProgramId: string,
    ownerId: string,
  ): Promise<AdoptedTrainingProgramDetail | null>;
}
