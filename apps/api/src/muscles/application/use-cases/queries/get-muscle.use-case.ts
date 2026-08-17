import { MuscleNotFoundError } from '../../errors/muscle.errors';
import type { MuscleDetails } from '../../models/get-muscles.models';
import type { MusclesQueriesPort } from '../../ports/muscles-queries.port';

export class GetMuscleUseCase {
  constructor(private readonly muscles: MusclesQueriesPort) {}

  async execute(slug: string): Promise<MuscleDetails> {
    const muscle = await this.muscles.findBySlug(slug);
    if (!muscle) {
      throw new MuscleNotFoundError();
    }
    return muscle;
  }
}
