import type { Routine } from '../../domain/entities/routine.entity';

export abstract class RoutinesCommandPort {
  abstract create(routine: Routine): Promise<void>;
  abstract findOwnedPrivateBySlug(
    slug: string,
    ownerId: string,
  ): Promise<Routine | null>;
  abstract findAccessibleAggregate(
    slug: string,
    ownerId: string,
  ): Promise<Routine | null>;
  abstract findCopyName(ownerId: string, sourceName: string): Promise<string>;
  abstract update(routine: Routine): Promise<void>;
  abstract deleteOwnedPrivateBySlug(
    slug: string,
    ownerId: string,
  ): Promise<void>;
}
