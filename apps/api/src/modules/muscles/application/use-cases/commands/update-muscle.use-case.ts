import type { UpdateMuscleInput } from '../../models/update-muscle.input';
import type { MusclesCommandPort } from '../../ports/muscles-command.port';

export class UpdateMuscleUseCase {
  constructor(private readonly muscles: MusclesCommandPort) {}

  async execute(
    slug: string,
    input: UpdateMuscleInput,
  ): Promise<{ slug: string }> {
    await this.muscles.updateBySlug(slug, input);
    return { slug };
  }
}
