import type { UpdateRoutineAttributes } from '../../domain/entities/routine.types';

export type UpdateRoutineInput = UpdateRoutineAttributes & {
  ownerId: string;
  slug: string;
};
