import type { AdoptedTrainingProgramSource } from '../models/adopted-training-program-source.model';

export abstract class AdoptedTrainingProgramSourcesPort {
  abstract findAccessibleBySlug(
    slug: string,
    ownerId: string,
  ): Promise<AdoptedTrainingProgramSource | null>;
}
