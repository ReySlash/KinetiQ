import { RoutineNotFoundError } from '../../errors/routine.errors';
import { Routine } from '../../../domain/entities/routine.entity';
import { RoutinesCommandPort } from '../../ports/routines-command.port';

export class DuplicateRoutineUseCase {
  constructor(private readonly routines: RoutinesCommandPort) {}

  async execute(input: {
    ownerId: string;
    slug: string;
  }): Promise<{ slug: string }> {
    const source = await this.routines.findAccessibleAggregate(
      input.slug,
      input.ownerId,
    );
    if (!source) throw new RoutineNotFoundError();

    const copyName = await this.routines.findCopyName(
      input.ownerId,
      source.name,
    );
    const duplicate = Routine.create({
      ownerId: input.ownerId,
      name: copyName,
      description: source.description,
      exercises: source.exercises.map((exercise) => ({
        exerciseSlug: exercise.exerciseSlug,
        sets: exercise.sets,
        minReps: exercise.minReps,
        maxReps: exercise.maxReps,
        targetRir: exercise.targetRir,
        restSeconds: exercise.restSeconds,
        tempo: exercise.tempo,
        notes: exercise.notes,
      })),
    });
    await this.routines.create(duplicate);
    return { slug: duplicate.slug };
  }
}
