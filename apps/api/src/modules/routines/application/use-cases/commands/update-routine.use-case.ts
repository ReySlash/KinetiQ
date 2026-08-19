import { RoutineNotFoundError } from '../../errors/routine.errors';
import type { UpdateRoutineInput } from '../../models/update-routine.input';
import { RoutinesCommandPort } from '../../ports/routines-command.port';

export class UpdateRoutineUseCase {
  constructor(private readonly routines: RoutinesCommandPort) {}

  async execute(input: UpdateRoutineInput): Promise<{ slug: string }> {
    const existing = await this.routines.findOwnedPrivateBySlug(
      input.slug,
      input.ownerId,
    );
    if (!existing) throw new RoutineNotFoundError();

    const { ownerId: _ownerId, slug: _slug, ...changes } = input;
    void _ownerId;
    void _slug;
    const updated = existing.update(changes);
    await this.routines.update(updated);
    return { slug: updated.slug };
  }
}
