import {
  RoutineListAuthenticationError,
  RoutineNotFoundError,
} from '../../errors/routine.errors';
import type { RoutineDetail } from '../../models/detail-routine.model';
import type { RoutinesQueryPort } from '../../ports/routines-query.port';
import { GetRoutineUseCase } from './get-routine.use-case';
import { ListRoutinesUseCase } from './list-routines.use-case';

describe('Routine query use cases', () => {
  it('requires an owner for the default private list', () => {
    const port: RoutinesQueryPort = {
      findAll: jest.fn(),
      findBySlug: jest.fn(),
    };
    expect(() => new ListRoutinesUseCase(port).execute()).toThrow(
      RoutineListAuthenticationError,
    );
  });

  it('maps private list options to an owner-scoped query', async () => {
    const findAll = jest.fn().mockResolvedValue([]);
    const port: RoutinesQueryPort = { findAll, findBySlug: jest.fn() };

    await new ListRoutinesUseCase(port).execute({
      ownerId: '123e4567-e89b-12d3-a456-426614174000',
      q: 'upper',
      sort: 'name:asc',
      limit: 10,
      offset: 20,
    });

    expect(findAll).toHaveBeenCalledWith({
      scope: 'my',
      ownerId: '123e4567-e89b-12d3-a456-426614174000',
      q: 'upper',
      sort: 'name:asc',
      limit: 10,
      offset: 20,
    });
  });

  it('allows anonymous global listing', async () => {
    const findAll = jest.fn().mockResolvedValue([]);
    const port: RoutinesQueryPort = { findAll, findBySlug: jest.fn() };

    await new ListRoutinesUseCase(port).execute({ scope: 'global' });

    expect(findAll).toHaveBeenCalledWith({
      scope: 'global',
      sort: 'updatedAt:desc',
      limit: 20,
      offset: 0,
    });
  });

  it('returns accessible detail and maps missing detail to not found', async () => {
    const detail = { slug: 'upper-body' } as RoutineDetail;
    const findBySlug = jest.fn().mockResolvedValue(detail);
    const port: RoutinesQueryPort = { findAll: jest.fn(), findBySlug };

    await expect(
      new GetRoutineUseCase(port).execute({ slug: detail.slug }),
    ).resolves.toBe(detail);
    expect(findBySlug).toHaveBeenCalledWith({ slug: detail.slug });

    findBySlug.mockResolvedValue(null);
    await expect(
      new GetRoutineUseCase(port).execute({ slug: 'missing' }),
    ).rejects.toBeInstanceOf(RoutineNotFoundError);
  });
});
