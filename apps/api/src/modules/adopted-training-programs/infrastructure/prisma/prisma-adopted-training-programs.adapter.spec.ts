jest.mock(
  '../../../shared/infrastructure/database/prisma/prisma.service',
  () => ({ PrismaService: class PrismaService {} }),
);

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../shared/infrastructure/database/prisma/prisma.service';
import {
  AdoptedTrainingProgramAlreadyNonTerminalError,
  AdoptedTrainingProgramConcurrencyError,
  AdoptedTrainingProgramNotFoundError,
  AdoptedTrainingProgramPersistenceError,
  AdoptedTrainingProgramSourceUnavailableError,
} from '../../application/errors/adopted-training-program.errors';
import { AdoptedTrainingProgram } from '../../domain/adopted-training-program.aggregate';
import {
  AdoptedTrainingProgramExerciseReferenceError,
  AdoptedTrainingProgramPersistenceStateError,
} from './prisma-adopted-training-program.errors';
import { PrismaAdoptedTrainingProgramsAdapter } from './prisma-adopted-training-programs.adapter';
import { WorkoutSessionValidationError } from '../../../workout-sessions/domain/errors/workout-session.errors';

const ownerId = '11111111-1111-4111-8111-111111111111';
const programId = '22222222-2222-4222-8222-222222222222';
const occurrenceId = '33333333-3333-4333-8333-333333333333';
const routineId = '44444444-4444-4444-8444-444444444444';
const exerciseId = '55555555-5555-4555-8555-555555555555';

describe('PrismaAdoptedTrainingProgramsAdapter', () => {
  const adoptedProgramCreate = jest.fn<Promise<unknown>, [{ data: unknown }]>();
  const adoptedProgramFindFirst = jest.fn<
    Promise<unknown>,
    [{ where: unknown; orderBy?: unknown; select?: unknown }]
  >();
  const adoptedProgramFindUniqueOrThrow = jest.fn();
  const adoptedProgramUpdateMany = jest.fn<
    Promise<{ count: number }>,
    [{ where: unknown; data: unknown }]
  >();
  const adoptedProgramUpdate = jest.fn<
    Promise<unknown>,
    [{ where: unknown; data: unknown }]
  >();
  const occurrenceFindFirst = jest.fn<
    Promise<unknown>,
    [{ where: unknown; orderBy?: unknown; select?: unknown }]
  >();
  const occurrenceUpdateMany = jest.fn<
    Promise<{ count: number }>,
    [{ where: unknown; data: unknown }]
  >();
  const occurrenceCount = jest.fn();
  const workoutSessionCreate = jest.fn<Promise<unknown>, [{ data: unknown }]>();
  const routineFindFirst = jest.fn();
  const trainingProgramFindFirst = jest.fn();
  const transaction = jest.fn(
    async (work: (client: object) => Promise<unknown>) =>
      work({
        adoptedTrainingProgram: {
          updateMany: adoptedProgramUpdateMany,
          findFirst: adoptedProgramFindFirst,
          findUniqueOrThrow: adoptedProgramFindUniqueOrThrow,
          update: adoptedProgramUpdate,
        },
        programWorkoutOccurrence: {
          findFirst: occurrenceFindFirst,
          updateMany: occurrenceUpdateMany,
          count: occurrenceCount,
        },
        routine: { findFirst: routineFindFirst },
        workoutSession: { create: workoutSessionCreate },
      }),
  );
  let adapter: PrismaAdoptedTrainingProgramsAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaAdoptedTrainingProgramsAdapter,
        {
          provide: PrismaService,
          useValue: {
            adoptedTrainingProgram: {
              create: adoptedProgramCreate,
              findFirst: adoptedProgramFindFirst,
              findUniqueOrThrow: adoptedProgramFindUniqueOrThrow,
              updateMany: adoptedProgramUpdateMany,
              update: adoptedProgramUpdate,
            },
            programWorkoutOccurrence: {
              findFirst: occurrenceFindFirst,
              updateMany: occurrenceUpdateMany,
              count: occurrenceCount,
            },
            trainingProgram: { findFirst: trainingProgramFindFirst },
            routine: { findFirst: routineFindFirst },
            workoutSession: { create: workoutSessionCreate },
            $transaction: transaction,
          },
        },
      ],
    }).compile();

    adapter = module.get(PrismaAdoptedTrainingProgramsAdapter);
    jest.resetAllMocks();
    transaction.mockImplementation(
      async (work: (client: object) => Promise<unknown>) =>
        work({
          adoptedTrainingProgram: {
            updateMany: adoptedProgramUpdateMany,
            findFirst: adoptedProgramFindFirst,
            findUniqueOrThrow: adoptedProgramFindUniqueOrThrow,
            update: adoptedProgramUpdate,
          },
          programWorkoutOccurrence: {
            findFirst: occurrenceFindFirst,
            updateMany: occurrenceUpdateMany,
            count: occurrenceCount,
          },
          routine: { findFirst: routineFindFirst },
          workoutSession: { create: workoutSessionCreate },
        }),
    );
  });

  function arrangeStartableOccurrence(): void {
    occurrenceFindFirst.mockResolvedValue({
      id: occurrenceId,
      sourceRoutineId: routineId,
      adoptedTrainingProgram: {
        startedAt: new Date('2026-08-01T10:00:00.000Z'),
      },
    });
    routineFindFirst.mockResolvedValue({
      id: routineId,
      name: 'Upper A',
      ownerId,
      visibility: 'PRIVATE',
      exercises: [
        {
          id: '77777777-7777-4777-8777-777777777777',
          order: 0,
          sets: 3,
          minReps: 8,
          maxReps: 10,
          targetRir: 2,
          restSeconds: 120,
          tempo: null,
          notes: null,
          exercise: { id: exerciseId, name: 'Bench Press', isActive: true },
        },
      ],
    });
  }

  it('creates the aggregate through Prisma nested writes', async () => {
    adoptedProgramCreate.mockResolvedValue(undefined);
    const program = AdoptedTrainingProgram.create({
      ownerId,
      sourceTrainingProgramId: programId,
      programNameSnapshot: 'Strength Base',
      durationWeeksSnapshot: 2,
      startedAt: new Date('2026-08-31T10:00:00.000Z'),
      occurrences: [
        {
          sourceTrainingProgramRoutineId: occurrenceId,
          sourceRoutineId: routineId,
          weekNumber: 1,
          dayNumber: 1,
          routineNameSnapshot: 'Upper A',
          programSlotNotesSnapshot: null,
        },
      ],
    });

    await adapter.create(program);

    expect(adoptedProgramCreate).toHaveBeenCalledTimes(1);
    expect(adoptedProgramCreate.mock.calls[0]?.[0].data).toMatchObject({
      id: program.id.value,
      owner: { connect: { id: ownerId } },
    });
    expect(adoptedProgramCreate.mock.calls[0]?.[0].data).toHaveProperty(
      'occurrences.create.0.sourceRoutineId',
      routineId,
    );
  });

  it('loads only accessible source programs and preserves inaccessible routine snapshots', async () => {
    trainingProgramFindFirst.mockResolvedValue({
      id: programId,
      name: 'Shared Program',
      durationWeeks: 2,
      routines: [
        {
          id: occurrenceId,
          weekNumber: 1,
          dayNumber: 1,
          notes: null,
          routine: {
            id: routineId,
            name: 'Private Routine',
            ownerId: '66666666-6666-4666-8666-666666666666',
            visibility: 'PRIVATE',
          },
        },
      ],
    });

    await expect(
      adapter.findAccessibleBySlug('shared-program', ownerId),
    ).resolves.toMatchObject({
      id: programId,
      schedule: [{ routineId: null, routineName: 'Private Routine' }],
    });
    expect(trainingProgramFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          slug: 'shared-program',
          OR: [{ visibility: 'GLOBAL' }, { visibility: 'PRIVATE', ownerId }],
        },
      }),
    );
  });

  it('uses conditional lifecycle updates and returns the persisted result', async () => {
    adoptedProgramUpdateMany.mockResolvedValue({ count: 1 });
    adoptedProgramFindUniqueOrThrow.mockResolvedValue({
      id: programId,
      status: 'PAUSED',
      updatedAt: new Date('2026-08-31T10:00:00.000Z'),
    });

    await expect(
      adapter.pause({ ownerId, adoptedTrainingProgramId: programId }),
    ).resolves.toEqual({
      id: programId,
      status: 'PAUSED',
      updatedAt: new Date('2026-08-31T10:00:00.000Z'),
    });
    expect(adoptedProgramUpdateMany.mock.calls[0]?.[0].where).toMatchObject({
      id: programId,
      ownerId,
      status: 'ACTIVE',
    });
    expect(transaction).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ isolationLevel: 'Serializable' }),
    );
  });

  it('resumes a paused program through the conditional transaction', async () => {
    adoptedProgramUpdateMany.mockResolvedValue({ count: 1 });
    adoptedProgramFindUniqueOrThrow.mockResolvedValue({
      id: programId,
      status: 'ACTIVE',
      updatedAt: new Date('2026-08-31T10:00:00.000Z'),
    });

    await expect(
      adapter.resume({ ownerId, adoptedTrainingProgramId: programId }),
    ).resolves.toMatchObject({ id: programId, status: 'ACTIVE' });
    expect(adoptedProgramUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: programId, ownerId, status: 'PAUSED' },
      }),
    );
  });

  it('rejects cancellation while an occurrence is in progress', async () => {
    adoptedProgramUpdateMany.mockResolvedValue({ count: 0 });

    await expect(
      adapter.cancel({ ownerId, adoptedTrainingProgramId: programId }),
    ).rejects.toBeInstanceOf(AdoptedTrainingProgramConcurrencyError);
    expect(adoptedProgramUpdateMany.mock.calls[0]?.[0].where).toMatchObject({
      ownerId,
      status: { in: ['ACTIVE', 'PAUSED'] },
      occurrences: { none: { status: 'IN_PROGRESS' } },
    });
  });

  it.each([
    [
      'pause',
      () => adapter.pause({ ownerId, adoptedTrainingProgramId: programId }),
    ],
    [
      'cancel',
      () => adapter.cancel({ ownerId, adoptedTrainingProgramId: programId }),
    ],
  ])(
    'conceals a missing or unowned %s target as not found',
    async (_name, execute) => {
      // Failure mode: EC-01
      // Arrange
      adoptedProgramUpdateMany.mockResolvedValue({ count: 0 });
      adoptedProgramFindFirst.mockResolvedValue(null);

      // Act
      const result = execute();

      // Assert
      await expect(result).rejects.toBeInstanceOf(
        AdoptedTrainingProgramNotFoundError,
      );
    },
  );

  it.each([
    [
      'skip',
      () =>
        adapter.skipOccurrence({
          ownerId,
          adoptedTrainingProgramId: programId,
          occurrenceId,
        }),
    ],
    [
      'start',
      () =>
        adapter.startProgramWorkout({
          ownerId,
          adoptedTrainingProgramId: programId,
          occurrenceId,
          timezone: 'UTC',
        }),
    ],
  ])(
    'conceals an occurrence outside the owned parent during %s',
    async (_name, execute) => {
      // Failure mode: EC-01
      // Arrange
      occurrenceFindFirst.mockResolvedValue(null);
      adoptedProgramFindFirst.mockResolvedValue({ id: programId, ownerId });

      // Act
      const result = execute();

      // Assert
      await expect(result).rejects.toBeInstanceOf(
        AdoptedTrainingProgramNotFoundError,
      );
    },
  );

  it('skips the final occurrence and completes the parent program', async () => {
    occurrenceFindFirst.mockResolvedValue({ id: occurrenceId });
    occurrenceUpdateMany.mockResolvedValue({ count: 1 });
    occurrenceCount.mockResolvedValue(0);
    adoptedProgramUpdate.mockResolvedValue(undefined);
    adoptedProgramFindUniqueOrThrow.mockResolvedValue({
      id: programId,
      status: 'COMPLETED',
      updatedAt: new Date('2026-08-31T10:00:00.000Z'),
    });

    await expect(
      adapter.skipOccurrence({
        ownerId,
        adoptedTrainingProgramId: programId,
        occurrenceId,
      }),
    ).resolves.toMatchObject({ id: programId, status: 'COMPLETED' });
    expect(adoptedProgramUpdate.mock.calls[0]?.[0].where).toEqual({
      id: programId,
    });
    expect(adoptedProgramUpdate.mock.calls[0]?.[0].data).toMatchObject({
      status: 'COMPLETED',
    });
  });

  it('reads the non-terminal program with owner-scoped filtering', async () => {
    adoptedProgramFindFirst.mockResolvedValue({
      id: programId,
      programNameSnapshot: 'Strength Base',
      status: 'PAUSED',
      durationWeeksSnapshot: 1,
      startedAt: new Date('2026-08-31T10:00:00.000Z'),
      completedAt: null,
      cancelledAt: null,
      occurrences: [
        {
          id: occurrenceId,
          weekNumber: 1,
          dayNumber: 1,
          routineNameSnapshot: 'Upper A',
          programSlotNotesSnapshot: null,
          status: 'PENDING',
          sourceRoutineId: null,
          sourceRoutine: null,
          sessionAttempts: [],
        },
      ],
    });

    await expect(
      adapter.findNonTerminalByOwner(ownerId),
    ).resolves.toMatchObject({ id: programId, status: 'PAUSED' });
    expect(adoptedProgramFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ownerId, status: { in: ['ACTIVE', 'PAUSED'] } },
      }),
    );
    expect(adoptedProgramFindFirst.mock.calls[0]?.[0].select).toBeDefined();
  });

  it('returns null for a missing owned detail and maps read failures', async () => {
    adoptedProgramFindFirst.mockResolvedValue(null);
    await expect(
      adapter.findOwnedDetailById(programId, ownerId),
    ).resolves.toBeNull();
    expect(adoptedProgramFindFirst.mock.calls[0]?.[0]).toMatchObject({
      where: { id: programId, ownerId },
    });
    expect(adoptedProgramFindFirst.mock.calls[0]?.[0].select).toBeDefined();

    adoptedProgramFindFirst.mockRejectedValue(
      new Error('database unavailable'),
    );
    await expect(
      adapter.findOwnedDetailById(programId, ownerId),
    ).rejects.toMatchObject({ code: 'ADOPTED_TRAINING_PROGRAM_QUERY_FAILED' });
  });

  it('returns null when no non-terminal program exists', async () => {
    adoptedProgramFindFirst.mockResolvedValue(null);

    await expect(adapter.findNonTerminalByOwner(ownerId)).resolves.toBeNull();
    expect(adoptedProgramFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ownerId, status: { in: ['ACTIVE', 'PAUSED'] } },
      }),
    );
  });

  it.each([
    [
      'pause',
      () => adapter.pause({ ownerId, adoptedTrainingProgramId: programId }),
    ],
    [
      'resume',
      () => adapter.resume({ ownerId, adoptedTrainingProgramId: programId }),
    ],
    [
      'cancel',
      () => adapter.cancel({ ownerId, adoptedTrainingProgramId: programId }),
    ],
    [
      'skip',
      () =>
        adapter.skipOccurrence({
          ownerId,
          adoptedTrainingProgramId: programId,
          occurrenceId,
        }),
    ],
  ])('maps a zero-row %s command to concurrency', async (_name, execute) => {
    adoptedProgramUpdateMany.mockResolvedValue({ count: 0 });
    occurrenceFindFirst.mockResolvedValue(null);

    await expect(execute()).rejects.toBeInstanceOf(
      AdoptedTrainingProgramConcurrencyError,
    );
  });

  it('starts the next visible routine atomically and snapshots its exercises', async () => {
    occurrenceFindFirst.mockResolvedValue({
      id: occurrenceId,
      sourceRoutineId: routineId,
    });
    routineFindFirst.mockResolvedValue({
      id: routineId,
      name: 'Upper A',
      ownerId,
      visibility: 'PRIVATE',
      exercises: [
        {
          id: '77777777-7777-4777-8777-777777777777',
          order: 0,
          sets: 3,
          minReps: 8,
          maxReps: 10,
          targetRir: 2,
          restSeconds: 120,
          tempo: '3-1-1-0',
          notes: 'Controlled',
          exercise: { id: exerciseId, name: 'Bench Press', isActive: true },
        },
      ],
    });
    workoutSessionCreate.mockResolvedValue(undefined);
    occurrenceUpdateMany.mockResolvedValue({ count: 1 });

    await expect(
      adapter.startProgramWorkout({
        ownerId,
        adoptedTrainingProgramId: programId,
        occurrenceId,
        timezone: 'Asia/Qatar',
      }),
    ).resolves.toMatchObject({
      occurrenceId,
      sessionStatus: 'IN_PROGRESS',
      occurrenceStatus: 'IN_PROGRESS',
    });
    expect(workoutSessionCreate.mock.calls[0]?.[0].data).toMatchObject({
      ownerId,
      sourceRoutineId: routineId,
      programWorkoutOccurrenceId: occurrenceId,
      timezone: 'Asia/Qatar',
    });
    expect(workoutSessionCreate.mock.calls[0]?.[0].data).toHaveProperty(
      'performances.create.0.exercise.connect.id',
      exerciseId,
    );
    expect(workoutSessionCreate.mock.calls[0]?.[0].data).toHaveProperty(
      'performances.create.0.exerciseNameSnapshot',
      'Bench Press',
    );
    expect(workoutSessionCreate.mock.calls[0]?.[0].data).toHaveProperty(
      'performances.create.0.targetSetCount',
      3,
    );
    expect(occurrenceUpdateMany.mock.calls[0]?.[0].where).toMatchObject({
      id: occurrenceId,
      status: 'PENDING',
      adoptedTrainingProgram: {
        ownerId,
        status: 'ACTIVE',
      },
    });
    expect(occurrenceFindFirst.mock.calls[0]?.[0].where).toEqual({
      adoptedTrainingProgramId: programId,
      status: 'PENDING',
      adoptedTrainingProgram: {
        id: programId,
        ownerId,
        status: 'ACTIVE',
      },
    });
    expect(occurrenceUpdateMany.mock.calls[0]?.[0].data).toMatchObject({
      status: 'IN_PROGRESS',
    });
  });

  it('propagates workout-session domain validation failures before persistence', async () => {
    arrangeStartableOccurrence();

    await expect(
      adapter.startProgramWorkout({
        ownerId,
        adoptedTrainingProgramId: programId,
        occurrenceId,
        timezone: 'Not/A_Timezone',
      }),
    ).rejects.toBeInstanceOf(WorkoutSessionValidationError);
    expect(workoutSessionCreate).not.toHaveBeenCalled();
    expect(occurrenceUpdateMany).not.toHaveBeenCalled();
  });

  it('keeps an unavailable source pending', async () => {
    occurrenceFindFirst.mockResolvedValue({
      id: occurrenceId,
      sourceRoutineId: null,
    });

    await expect(
      adapter.startProgramWorkout({
        ownerId,
        adoptedTrainingProgramId: programId,
        occurrenceId,
        timezone: 'UTC',
      }),
    ).rejects.toBeInstanceOf(AdoptedTrainingProgramSourceUnavailableError);
    expect(workoutSessionCreate).not.toHaveBeenCalled();
    expect(occurrenceUpdateMany).not.toHaveBeenCalled();
  });

  it('keeps an occurrence pending when its source routine has no exercises', async () => {
    // Failure mode: NE-04
    // Arrange
    occurrenceFindFirst.mockResolvedValue({
      id: occurrenceId,
      sourceRoutineId: routineId,
    });
    routineFindFirst.mockResolvedValue({
      id: routineId,
      name: 'Upper A',
      ownerId,
      visibility: 'PRIVATE',
      exercises: [],
    });

    // Act
    const result = adapter.startProgramWorkout({
      ownerId,
      adoptedTrainingProgramId: programId,
      occurrenceId,
      timezone: 'UTC',
    });

    // Assert
    await expect(result).rejects.toBeInstanceOf(
      AdoptedTrainingProgramSourceUnavailableError,
    );
    expect(workoutSessionCreate).not.toHaveBeenCalled();
    expect(occurrenceUpdateMany).not.toHaveBeenCalled();
  });

  it.each([
    [
      'more than five minutes in the future',
      new Date('2026-08-31T10:05:00.001Z'),
    ],
    ['more than thirty days in the past', new Date('2026-08-01T09:59:59.999Z')],
  ])(
    'rejects a workout start timestamp %s without writing',
    async (_label, startedAt) => {
      // Failure mode: BC-03
      // Arrange
      jest.useFakeTimers().setSystemTime(new Date('2026-08-31T10:00:00.000Z'));
      arrangeStartableOccurrence();
      workoutSessionCreate.mockResolvedValue(undefined);
      occurrenceUpdateMany.mockResolvedValue({ count: 1 });

      try {
        // Act
        const result = adapter.startProgramWorkout({
          ownerId,
          adoptedTrainingProgramId: programId,
          occurrenceId,
          timezone: 'UTC',
          startedAt,
        });

        // Assert
        await expect(result).rejects.toThrow();
        expect(workoutSessionCreate).not.toHaveBeenCalled();
        expect(occurrenceUpdateMany).not.toHaveBeenCalled();
      } finally {
        jest.useRealTimers();
      }
    },
  );

  it.each([
    ['the five-minute future tolerance', new Date('2026-08-31T10:05:00.000Z')],
    ['the thirty-day backdating limit', new Date('2026-08-01T10:00:00.000Z')],
  ])('accepts a workout start timestamp at %s', async (_label, startedAt) => {
    // Failure mode: BC-03
    // Arrange
    jest.useFakeTimers().setSystemTime(new Date('2026-08-31T10:00:00.000Z'));
    arrangeStartableOccurrence();
    workoutSessionCreate.mockResolvedValue(undefined);
    occurrenceUpdateMany.mockResolvedValue({ count: 1 });

    try {
      // Act
      const result = adapter.startProgramWorkout({
        ownerId,
        adoptedTrainingProgramId: programId,
        occurrenceId,
        timezone: 'UTC',
        startedAt,
      });

      // Assert
      await expect(result).resolves.toMatchObject({ occurrenceId });
      expect(workoutSessionCreate).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });

  it('rejects a backdated workout start before the adopted program began', async () => {
    // Failure mode: BC-03
    // Arrange
    jest.useFakeTimers().setSystemTime(new Date('2026-08-31T10:00:00.000Z'));
    arrangeStartableOccurrence();
    workoutSessionCreate.mockResolvedValue(undefined);
    occurrenceUpdateMany.mockResolvedValue({ count: 1 });
    occurrenceFindFirst.mockResolvedValue({
      id: occurrenceId,
      sourceRoutineId: routineId,
      adoptedTrainingProgram: {
        startedAt: new Date('2026-08-30T10:00:00.000Z'),
      },
    });

    try {
      // Act
      const result = adapter.startProgramWorkout({
        ownerId,
        adoptedTrainingProgramId: programId,
        occurrenceId,
        timezone: 'UTC',
        startedAt: new Date('2026-08-30T09:59:59.999Z'),
      });

      // Assert
      await expect(result).rejects.toThrow();
      expect(workoutSessionCreate).not.toHaveBeenCalled();
      expect(occurrenceUpdateMany).not.toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });

  it('rejects a source routine that exists but is not visible to the owner', async () => {
    occurrenceFindFirst.mockResolvedValue({
      id: occurrenceId,
      sourceRoutineId: routineId,
    });
    routineFindFirst.mockResolvedValue(null);

    await expect(
      adapter.startProgramWorkout({
        ownerId,
        adoptedTrainingProgramId: programId,
        occurrenceId,
        timezone: 'UTC',
      }),
    ).rejects.toBeInstanceOf(AdoptedTrainingProgramSourceUnavailableError);
    expect(workoutSessionCreate).not.toHaveBeenCalled();
    expect(occurrenceUpdateMany).not.toHaveBeenCalled();
  });

  it('keeps the occurrence pending when its routine contains an inactive exercise', async () => {
    occurrenceFindFirst.mockResolvedValue({
      id: occurrenceId,
      sourceRoutineId: routineId,
    });
    routineFindFirst.mockResolvedValue({
      id: routineId,
      name: 'Upper A',
      ownerId,
      visibility: 'PRIVATE',
      exercises: [
        {
          id: '77777777-7777-4777-8777-777777777777',
          order: 0,
          sets: 3,
          minReps: 8,
          maxReps: 10,
          targetRir: 2,
          restSeconds: null,
          tempo: null,
          notes: null,
          exercise: { id: exerciseId, name: 'Bench Press', isActive: false },
        },
      ],
    });

    await expect(
      adapter.startProgramWorkout({
        ownerId,
        adoptedTrainingProgramId: programId,
        occurrenceId,
        timezone: 'UTC',
      }),
    ).rejects.toBeInstanceOf(AdoptedTrainingProgramSourceUnavailableError);
    expect(workoutSessionCreate).not.toHaveBeenCalled();
    expect(occurrenceUpdateMany).not.toHaveBeenCalled();
  });

  it('returns a concurrency error when the requested occurrence is not next', async () => {
    occurrenceFindFirst.mockResolvedValue({
      id: '88888888-8888-4888-8888-888888888888',
      sourceRoutineId: routineId,
    });

    await expect(
      adapter.startProgramWorkout({
        ownerId,
        adoptedTrainingProgramId: programId,
        occurrenceId,
        timezone: 'UTC',
      }),
    ).rejects.toBeInstanceOf(AdoptedTrainingProgramConcurrencyError);
    expect(workoutSessionCreate).not.toHaveBeenCalled();
  });

  it('maps named partial-index conflicts to domain-relevant application errors', async () => {
    adoptedProgramCreate.mockRejectedValue(
      prismaError('P2002', {
        target: 'AdoptedTrainingProgram_one_non_terminal_per_owner_idx',
      }),
    );
    await expect(
      adapter.create(
        AdoptedTrainingProgram.create({
          ownerId,
          programNameSnapshot: 'Strength Base',
          durationWeeksSnapshot: 1,
          startedAt: new Date(),
          occurrences: [
            {
              sourceTrainingProgramRoutineId: null,
              sourceRoutineId: null,
              weekNumber: 1,
              dayNumber: 1,
              routineNameSnapshot: 'Upper A',
              programSlotNotesSnapshot: null,
            },
          ],
        }),
      ),
    ).rejects.toBeInstanceOf(AdoptedTrainingProgramAlreadyNonTerminalError);

    occurrenceFindFirst.mockRejectedValue(prismaError('P2034'));
    await expect(
      adapter.startProgramWorkout({
        ownerId,
        adoptedTrainingProgramId: programId,
        occurrenceId,
        timezone: 'UTC',
      }),
    ).rejects.toBeInstanceOf(AdoptedTrainingProgramConcurrencyError);
  });

  it.each([
    'WorkoutSession_one_in_progress_per_owner_idx',
    'WorkoutSession_one_in_progress_per_occurrence_idx',
  ])(
    'maps the approved %s uniqueness race to concurrency',
    async (constraint) => {
      // Failure mode: EC-03
      // Arrange
      arrangeStartableOccurrence();
      workoutSessionCreate.mockRejectedValue(
        prismaError('P2002', {
          modelName: 'WorkoutSession',
          target: constraint,
        }),
      );

      // Act
      const result = adapter.startProgramWorkout({
        ownerId,
        adoptedTrainingProgramId: programId,
        occurrenceId,
        timezone: 'UTC',
      });

      // Assert
      await expect(result).rejects.toBeInstanceOf(
        AdoptedTrainingProgramConcurrencyError,
      );
    },
  );

  it.each([
    [
      'an unrelated WorkoutSession constraint',
      prismaError('P2002', {
        modelName: 'WorkoutSession',
        target: 'WorkoutSession_external_reference_key',
      }),
    ],
    ['missing constraint metadata', prismaError('P2002')],
    [
      'a uniqueness failure from another model',
      prismaError('P2002', {
        modelName: 'Exercise',
        target: 'Exercise_slug_key',
      }),
    ],
    [
      'a non-uniqueness Prisma failure',
      prismaError('P2024', {
        modelName: 'WorkoutSession',
        target: 'WorkoutSession_one_in_progress_per_owner_idx',
      }),
    ],
  ])('does not reclassify %s as concurrency', async (_label, error) => {
    // Failure mode: EC-03
    // Arrange
    arrangeStartableOccurrence();
    workoutSessionCreate.mockRejectedValue(error);

    // Act
    const result = adapter.startProgramWorkout({
      ownerId,
      adoptedTrainingProgramId: programId,
      occurrenceId,
      timezone: 'UTC',
    });

    // Assert
    await expect(result).rejects.toBeInstanceOf(
      AdoptedTrainingProgramPersistenceError,
    );
  });

  it('keeps source and persistence errors distinct', async () => {
    workoutSessionCreate.mockRejectedValue(
      prismaError('P2003', { target: ['exerciseId'] }),
    );
    occurrenceFindFirst.mockResolvedValue({
      id: occurrenceId,
      sourceRoutineId: routineId,
    });
    routineFindFirst.mockResolvedValue({
      id: routineId,
      name: 'Upper A',
      ownerId,
      visibility: 'PRIVATE',
      exercises: [
        {
          id: '77777777-7777-4777-8777-777777777777',
          order: 0,
          sets: 3,
          minReps: 8,
          maxReps: 10,
          targetRir: 2,
          restSeconds: null,
          tempo: null,
          notes: null,
          exercise: { id: exerciseId, name: 'Bench Press', isActive: true },
        },
      ],
    });
    await expect(
      adapter.startProgramWorkout({
        ownerId,
        adoptedTrainingProgramId: programId,
        occurrenceId,
        timezone: 'UTC',
      }),
    ).rejects.toBeInstanceOf(AdoptedTrainingProgramExerciseReferenceError);

    adoptedProgramUpdateMany.mockRejectedValue(prismaError('P2025'));
    await expect(
      adapter.pause({ ownerId, adoptedTrainingProgramId: programId }),
    ).rejects.toBeInstanceOf(AdoptedTrainingProgramPersistenceStateError);
  });

  it('maps driver-adapter foreign-key metadata to source-unavailable errors', async () => {
    workoutSessionCreate.mockRejectedValue(
      prismaError('P2003', {
        driverAdapterError: {
          cause: {
            constraint: 'ProgramWorkoutOccurrence_sourceRoutineId_fkey',
          },
        },
      }),
    );
    arrangeStartableOccurrence();

    await expect(
      adapter.startProgramWorkout({
        ownerId,
        adoptedTrainingProgramId: programId,
        occurrenceId,
        timezone: 'UTC',
      }),
    ).rejects.toBeInstanceOf(AdoptedTrainingProgramSourceUnavailableError);
  });

  it('maps unknown read, command, and execution failures to their infrastructure errors', async () => {
    adoptedProgramFindFirst.mockRejectedValue(new Error('read failed'));
    await expect(adapter.findNonTerminalByOwner(ownerId)).rejects.toMatchObject(
      {
        code: 'ADOPTED_TRAINING_PROGRAM_QUERY_FAILED',
      },
    );

    adoptedProgramFindFirst.mockReset();
    adoptedProgramUpdateMany.mockRejectedValue(new Error('command failed'));
    await expect(
      adapter.pause({ ownerId, adoptedTrainingProgramId: programId }),
    ).rejects.toMatchObject({
      code: 'ADOPTED_TRAINING_PROGRAM_PERSISTENCE_FAILED',
    });

    adoptedProgramUpdateMany.mockReset();
    arrangeStartableOccurrence();
    workoutSessionCreate.mockRejectedValue(new Error('execution failed'));
    await expect(
      adapter.startProgramWorkout({
        ownerId,
        adoptedTrainingProgramId: programId,
        occurrenceId,
        timezone: 'UTC',
      }),
    ).rejects.toMatchObject({
      code: 'ADOPTED_TRAINING_PROGRAM_PERSISTENCE_FAILED',
    });
  });
});

function prismaError(code: string, meta?: unknown): Record<string, unknown> {
  return { code, meta };
}
