import type { MusclesCommandPort } from '../../ports/muscles-command.port';

export class DeactivateMuscleUseCase {
  constructor(private readonly muscles: MusclesCommandPort) {}

  async execute(id: string): Promise<{ id: string }> {
    await this.muscles.deactivateById(id);
    return { id };
  }
}
