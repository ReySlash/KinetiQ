import { RoutinesCommandPort } from '../../ports/routines-command.port';

export class DeleteRoutineUseCase {
  constructor(private readonly routines: RoutinesCommandPort) {}

  async execute(input: {
    ownerId: string;
    slug: string;
  }): Promise<{ slug: string }> {
    await this.routines.deleteOwnedPrivateBySlug(input.slug, input.ownerId);
    return { slug: input.slug };
  }
}
