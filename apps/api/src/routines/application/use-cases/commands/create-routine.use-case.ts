import { Routine } from '../../../domain/entities/routine.entity';
import type { CreateRoutineInput } from '../../models/create-routine.input';
import { RoutinesCommandPort } from '../../ports/routines-command.port';

export class CreateRoutineUseCase {
  constructor(private readonly routines: RoutinesCommandPort) {}

  async execute(input: CreateRoutineInput): Promise<{ slug: string }> {
    const routine = Routine.create(input);
    await this.routines.create(routine);
    return { slug: routine.slug };
  }
}
