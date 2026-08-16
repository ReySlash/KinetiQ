import type { MusclesCommandRepository } from '../../ports/muscles-command.port';

export class DeactivateMuscleUseCase {
  constructor(private readonly muscles: MusclesCommandRepository) {}

  async execute(id: string): Promise<{ id: string }> {
    await this.muscles.deactivateById(id);
    return { id };
  }
}
