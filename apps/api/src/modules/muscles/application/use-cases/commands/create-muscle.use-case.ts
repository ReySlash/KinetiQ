import { Muscle } from '../../../domain/entities/muscle.entity';
import type { CreateMuscleInput } from '../../models/create-muscle.input';
import type { MusclesCommandPort } from '../../ports/muscles-command.port';

export class CreateMuscleUseCase {
  constructor(private readonly muscles: MusclesCommandPort) {}

  async execute(
    input: CreateMuscleInput,
  ): Promise<{ id: string; slug: string }> {
    const muscle = Muscle.create(input);
    await this.muscles.create(muscle);
    return { id: muscle.id.value, slug: muscle.slug };
  }
}
