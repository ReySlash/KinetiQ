import { Routine } from '../../../domain/entities/routine.entity';
import { RoutineNotFoundError } from '../../errors/routine.errors';
import type { RoutinesCommandPort } from '../../ports/routines-command.port';
import { CreateRoutineUseCase } from './create-routine.use-case';
import { DeleteRoutineUseCase } from './delete-routine.use-case';
import { DuplicateRoutineUseCase } from './duplicate-routine.use-case';
import { UpdateRoutineUseCase } from './update-routine.use-case';

const ownerId = '123e4567-e89b-12d3-a456-426614174000';
const source = Routine.create({
  ownerId,
  name: 'Upper Body',
  description: 'Pressing day',
  exercises: [
    {
      exerciseSlug: 'bench-press',
      sets: 3,
      minReps: 8,
      maxReps: 12,
    },
  ],
});

function repository(): RoutinesCommandPort {
  return {
    create: jest.fn().mockResolvedValue(undefined),
    findOwnedPrivateBySlug: jest.fn(),
    findAccessibleAggregate: jest.fn(),
    findCopyName: jest.fn(),
    update: jest.fn().mockResolvedValue(undefined),
    deleteOwnedPrivateBySlug: jest.fn().mockResolvedValue(undefined),
  };
}

describe('Routine command use cases', () => {
  it('creates a routine aggregate', async () => {
    const port = repository();
    const result = await new CreateRoutineUseCase(port).execute({
      ownerId,
      name: 'Upper Body',
      exercises: [],
    });

    expect(result.slug).toMatch(/^upper-body-[a-f0-9]{8}$/);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(port.create).toHaveBeenCalledTimes(1);
  });

  it('updates an owned routine while preserving omitted fields', async () => {
    const port = repository();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    jest.mocked(port.findOwnedPrivateBySlug).mockResolvedValue(source);

    await expect(
      new UpdateRoutineUseCase(port).execute({
        ownerId,
        slug: source.slug,
        name: 'Upper Body B',
      }),
    ).resolves.toEqual({ slug: source.slug });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(port.update).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Upper Body B',
        description: 'Pressing day',
      }),
    );
  });

  it('rejects updates for inaccessible routines', async () => {
    const port = repository();
    await expect(
      new UpdateRoutineUseCase(port).execute({ ownerId, slug: 'missing' }),
    ).rejects.toBeInstanceOf(RoutineNotFoundError);
  });

  it('deletes through the owner-scoped command port', async () => {
    const port = repository();
    await expect(
      new DeleteRoutineUseCase(port).execute({ ownerId, slug: source.slug }),
    ).resolves.toEqual({ slug: source.slug });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(port.deleteOwnedPrivateBySlug).toHaveBeenCalledWith(
      source.slug,
      ownerId,
    );
  });

  it('duplicates an accessible routine into a private owned routine', async () => {
    const port = repository();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    jest.mocked(port.findAccessibleAggregate).mockResolvedValue(source);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    jest.mocked(port.findCopyName).mockResolvedValue('Upper Body (Copy)');

    const result = await new DuplicateRoutineUseCase(port).execute({
      ownerId,
      slug: source.slug,
    });

    expect(result.slug).toMatch(/^upper-body-copy-[a-f0-9]{8}$/);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(port.findCopyName).toHaveBeenCalledWith(ownerId, 'Upper Body');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(port.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerId,
        name: 'Upper Body (Copy)',
        visibility: 'PRIVATE',
      }),
    );
  });
});
