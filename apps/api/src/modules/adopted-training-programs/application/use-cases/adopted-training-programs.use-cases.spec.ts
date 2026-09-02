import type { AdoptedTrainingProgramDetail } from '../models/adopted-training-program-detail.model';
import type {
  AdoptedTrainingProgramCommandResult,
  StartProgramWorkoutOccurrenceInput,
  StartProgramWorkoutOccurrenceResult,
} from '../models/adopted-training-program-command.input';
import {
  AdoptedTrainingProgramConcurrencyError,
  AdoptedTrainingProgramNotFoundError,
  AdoptedTrainingProgramPersistenceError,
  AdoptedTrainingProgramQueryError,
  AdoptedTrainingProgramSourceUnavailableError,
} from '../errors/adopted-training-program.errors';
import { AdoptTrainingProgramUseCase } from './adopt-training-program.use-case';
import { CancelAdoptedTrainingProgramUseCase } from './cancel-adopted-training-program.use-case';
import { GetNonTerminalAdoptedTrainingProgramUseCase } from './get-non-terminal-adopted-training-program.use-case';
import { GetAdoptedTrainingProgramUseCase } from './get-adopted-training-program.use-case';
import { PauseAdoptedTrainingProgramUseCase } from './pause-adopted-training-program.use-case';
import { ResumeAdoptedTrainingProgramUseCase } from './resume-adopted-training-program.use-case';
import { SkipProgramWorkoutOccurrenceUseCase } from './skip-program-workout-occurrence.use-case';
import { StartProgramWorkoutOccurrenceUseCase } from './start-program-workout-occurrence.use-case';
import {
  createCommandPort,
  createExecutionPort,
  createQueryPort,
} from './adopted-training-programs.test-doubles';

const ownerId = '11111111-1111-4111-8111-111111111111';
const adoptedProgramId = '22222222-2222-4222-8222-222222222222';
const occurrenceId = '33333333-3333-4333-8333-333333333333';
const sourceRoutineId = '44444444-4444-4444-8444-444444444444';

function detail(): AdoptedTrainingProgramDetail {
  return {
    id: adoptedProgramId,
    programNameSnapshot: 'Strength Base',
    status: 'ACTIVE',
    durationWeeksSnapshot: 2,
    startedAt: new Date('2026-01-01T10:00:00.000Z'),
    completedAt: null,
    cancelledAt: null,
    totalCount: 1,
    completedCount: 0,
    skippedCount: 0,
    resolvedCount: 0,
    progressPercent: 0,
    occurrences: [],
    nextPendingOccurrence: null,
    actions: {
      canPause: true,
      canResume: false,
      canCancel: true,
      canStartNext: true,
      canSkipNext: true,
    },
  };
}

function commandResult(
  status: AdoptedTrainingProgramCommandResult['status'] = 'ACTIVE',
) {
  return {
    id: adoptedProgramId,
    status,
    updatedAt: new Date('2026-01-01T10:00:00.000Z'),
  } satisfies AdoptedTrainingProgramCommandResult;
}

describe('adopted-training-program application use cases', () => {
  it('normalizes the source slug and delegates adoption atomically', async () => {
    const result = {
      id: adoptedProgramId,
      status: 'ACTIVE' as const,
      startedAt: new Date('2026-01-01T10:00:00.000Z'),
    };
    const adopt = jest.fn().mockResolvedValue(result);

    await expect(
      new AdoptTrainingProgramUseCase(createCommandPort({ adopt })).execute({
        ownerId,
        sourceProgramSlug: ' Strength-Base ',
      }),
    ).resolves.toBe(result);
    expect(adopt).toHaveBeenCalledWith({
      ownerId,
      sourceProgramSlug: 'strength-base',
    });
  });

  it('does not call ports when the principal identifier is invalid', async () => {
    const adopt = jest.fn();
    await expect(
      new AdoptTrainingProgramUseCase(createCommandPort({ adopt })).execute({
        ownerId: 'invalid-owner',
        sourceProgramSlug: 'strength-base',
      }),
    ).rejects.toThrow();
    expect(adopt).not.toHaveBeenCalled();
  });

  it('returns owner-scoped projections', async () => {
    const value = detail();
    const findNonTerminalByOwner = jest.fn().mockResolvedValue(value);
    const findOwnedDetailById = jest.fn().mockResolvedValue(value);
    const queries = createQueryPort({
      findNonTerminalByOwner,
      findOwnedDetailById,
    });
    await expect(
      new GetNonTerminalAdoptedTrainingProgramUseCase(queries).execute(ownerId),
    ).resolves.toBe(value);
    expect(findNonTerminalByOwner).toHaveBeenCalledWith(ownerId);
    await expect(
      new GetAdoptedTrainingProgramUseCase(queries).execute(
        adoptedProgramId,
        ownerId,
      ),
    ).resolves.toBe(value);
    expect(findOwnedDetailById).toHaveBeenCalledWith(adoptedProgramId, ownerId);
  });

  it('returns null when the owner has no non-terminal program', async () => {
    const findNonTerminalByOwner = jest.fn().mockResolvedValue(null);
    await expect(
      new GetNonTerminalAdoptedTrainingProgramUseCase(
        createQueryPort({ findNonTerminalByOwner }),
      ).execute(ownerId),
    ).resolves.toBeNull();
  });

  it('propagates detail query failures without rewriting them', async () => {
    const failure = new AdoptedTrainingProgramQueryError();
    const findOwnedDetailById = jest.fn().mockRejectedValue(failure);

    await expect(
      new GetAdoptedTrainingProgramUseCase(
        createQueryPort({ findOwnedDetailById }),
      ).execute(adoptedProgramId, ownerId),
    ).rejects.toBe(failure);
  });

  it('rejects invalid owner and program identifiers before querying details', async () => {
    const findNonTerminalByOwner = jest.fn();
    const findOwnedDetailById = jest.fn();
    const queries = createQueryPort({
      findNonTerminalByOwner,
      findOwnedDetailById,
    });

    expect(() =>
      new GetNonTerminalAdoptedTrainingProgramUseCase(queries).execute(
        'invalid-owner',
      ),
    ).toThrow();
    await expect(
      new GetAdoptedTrainingProgramUseCase(queries).execute(
        'invalid-program',
        ownerId,
      ),
    ).rejects.toThrow();
    await expect(
      new GetAdoptedTrainingProgramUseCase(queries).execute(
        adoptedProgramId,
        'invalid-owner',
      ),
    ).rejects.toThrow();
    expect(findNonTerminalByOwner).not.toHaveBeenCalled();
    expect(findOwnedDetailById).not.toHaveBeenCalled();
  });

  it('conceals an inaccessible adopted program as not found', async () => {
    await expect(
      new GetAdoptedTrainingProgramUseCase(
        createQueryPort({
          findOwnedDetailById: jest.fn().mockResolvedValue(null),
        }),
      ).execute(adoptedProgramId, ownerId),
    ).rejects.toThrow(AdoptedTrainingProgramNotFoundError);
  });

  it.each([
    ['pause', PauseAdoptedTrainingProgramUseCase],
    ['resume', ResumeAdoptedTrainingProgramUseCase],
    ['cancel', CancelAdoptedTrainingProgramUseCase],
  ])('delegates %s as one atomic command', async (method, UseCase) => {
    const pause = jest.fn().mockResolvedValue(commandResult('PAUSED'));
    const resume = jest.fn().mockResolvedValue(commandResult('ACTIVE'));
    const cancel = jest.fn().mockResolvedValue(commandResult('CANCELLED'));
    const commands = createCommandPort({
      pause,
      resume,
      cancel,
    });
    const input = { ownerId, adoptedTrainingProgramId: adoptedProgramId };
    const expectedCommand = { pause, resume, cancel }[method];
    const expectedResult = {
      pause: commandResult('PAUSED'),
      resume: commandResult('ACTIVE'),
      cancel: commandResult('CANCELLED'),
    }[method];
    await expect(new UseCase(commands).execute(input)).resolves.toEqual(
      expectedResult,
    );
    expect(expectedCommand).toHaveBeenCalledTimes(1);
    expect(expectedCommand).toHaveBeenCalledWith(input);
    for (const [name, command] of Object.entries({ pause, resume, cancel })) {
      if (name !== method) {
        expect(command).not.toHaveBeenCalled();
      }
    }
  });

  it('delegates skipping as one atomic command', async () => {
    const skipOccurrence = jest.fn().mockResolvedValue(commandResult());
    const input = {
      ownerId,
      adoptedTrainingProgramId: adoptedProgramId,
      occurrenceId,
    };
    await expect(
      new SkipProgramWorkoutOccurrenceUseCase(
        createCommandPort({ skipOccurrence }),
      ).execute(input),
    ).resolves.toEqual(commandResult());
    expect(skipOccurrence).toHaveBeenCalledWith(input);
  });

  it('does not delegate skip when an identifier is invalid', () => {
    const skipOccurrence = jest.fn();

    expect(() =>
      new SkipProgramWorkoutOccurrenceUseCase(
        createCommandPort({ skipOccurrence }),
      ).execute({
        ownerId,
        adoptedTrainingProgramId: adoptedProgramId,
        occurrenceId: 'invalid-occurrence',
      }),
    ).toThrow();
    expect(skipOccurrence).not.toHaveBeenCalled();
  });

  it.each([
    PauseAdoptedTrainingProgramUseCase,
    ResumeAdoptedTrainingProgramUseCase,
    CancelAdoptedTrainingProgramUseCase,
  ])(
    'does not delegate lifecycle commands when the adopted-program identifier is invalid',
    (UseCase) => {
      const command = jest.fn();

      expect(() =>
        new UseCase({
          pause: command,
          resume: command,
          cancel: command,
        }).execute({
          ownerId,
          adoptedTrainingProgramId: 'invalid-adopted-program',
        }),
      ).toThrow();
      expect(command).not.toHaveBeenCalled();
    },
  );

  it('does not delegate start when the occurrence identifier is invalid', () => {
    const startProgramWorkout = jest.fn();

    expect(() =>
      new StartProgramWorkoutOccurrenceUseCase(
        createExecutionPort({ startProgramWorkout }),
      ).execute({
        ownerId,
        adoptedTrainingProgramId: adoptedProgramId,
        occurrenceId: 'invalid-occurrence',
        timezone: 'UTC',
      }),
    ).toThrow();
    expect(startProgramWorkout).not.toHaveBeenCalled();
  });

  it.each([
    PauseAdoptedTrainingProgramUseCase,
    ResumeAdoptedTrainingProgramUseCase,
    CancelAdoptedTrainingProgramUseCase,
  ])(
    'does not issue a lifecycle command for invalid identifiers',
    (UseCase) => {
      const command = jest.fn();
      expect(() =>
        new UseCase({
          pause: command,
          resume: command,
          cancel: command,
        }).execute({
          ownerId: 'invalid-owner',
          adoptedTrainingProgramId: adoptedProgramId,
        }),
      ).toThrow();
      expect(command).not.toHaveBeenCalled();
    },
  );

  it('propagates query and command failures', async () => {
    const queryFailure = new AdoptedTrainingProgramQueryError();
    await expect(
      new GetNonTerminalAdoptedTrainingProgramUseCase(
        createQueryPort({
          findNonTerminalByOwner: jest.fn().mockRejectedValue(queryFailure),
        }),
      ).execute(ownerId),
    ).rejects.toBe(queryFailure);
    const persistenceFailure = new AdoptedTrainingProgramPersistenceError();
    await expect(
      new PauseAdoptedTrainingProgramUseCase(
        createCommandPort({
          pause: jest.fn().mockRejectedValue(persistenceFailure),
        }),
      ).execute({
        ownerId,
        adoptedTrainingProgramId: adoptedProgramId,
      }),
    ).rejects.toBe(persistenceFailure);

    const resumeFailure = new AdoptedTrainingProgramConcurrencyError();
    await expect(
      new ResumeAdoptedTrainingProgramUseCase(
        createCommandPort({
          resume: jest.fn().mockRejectedValue(resumeFailure),
        }),
      ).execute({
        ownerId,
        adoptedTrainingProgramId: adoptedProgramId,
      }),
    ).rejects.toBe(resumeFailure);

    const cancelFailure = new AdoptedTrainingProgramPersistenceError();
    await expect(
      new CancelAdoptedTrainingProgramUseCase(
        createCommandPort({
          cancel: jest.fn().mockRejectedValue(cancelFailure),
        }),
      ).execute({
        ownerId,
        adoptedTrainingProgramId: adoptedProgramId,
      }),
    ).rejects.toBe(cancelFailure);

    const skipFailure = new AdoptedTrainingProgramConcurrencyError();
    await expect(
      new SkipProgramWorkoutOccurrenceUseCase(
        createCommandPort({
          skipOccurrence: jest.fn().mockRejectedValue(skipFailure),
        }),
      ).execute({
        ownerId,
        adoptedTrainingProgramId: adoptedProgramId,
        occurrenceId,
      }),
    ).rejects.toBe(skipFailure);
  });

  it('delegates program workout start as one atomic execution operation', async () => {
    const startProgramWorkout = jest
      .fn<
        Promise<StartProgramWorkoutOccurrenceResult>,
        [StartProgramWorkoutOccurrenceInput]
      >()
      .mockResolvedValue({
        workoutSessionId: sourceRoutineId,
        occurrenceId,
        sessionStatus: 'IN_PROGRESS',
        occurrenceStatus: 'IN_PROGRESS',
      });
    const input: StartProgramWorkoutOccurrenceInput = {
      ownerId,
      adoptedTrainingProgramId: adoptedProgramId,
      occurrenceId,
      timezone: 'UTC',
      startedAt: new Date('2026-08-31T10:00:00.000Z'),
    };
    const result = await new StartProgramWorkoutOccurrenceUseCase(
      createExecutionPort({ startProgramWorkout }),
    ).execute(input);
    expect(result).toEqual({
      workoutSessionId: sourceRoutineId,
      occurrenceId,
      sessionStatus: 'IN_PROGRESS',
      occurrenceStatus: 'IN_PROGRESS',
    });
    expect(startProgramWorkout).toHaveBeenCalledWith(input);
  });

  it('propagates start-operation failures without rewriting them', async () => {
    const sourceUnavailable =
      new AdoptedTrainingProgramSourceUnavailableError();
    await expect(
      new StartProgramWorkoutOccurrenceUseCase(
        createExecutionPort({
          startProgramWorkout: jest.fn().mockRejectedValue(sourceUnavailable),
        }),
      ).execute({
        ownerId,
        adoptedTrainingProgramId: adoptedProgramId,
        occurrenceId,
        timezone: 'UTC',
      }),
    ).rejects.toBe(sourceUnavailable);

    const concurrencyFailure = new AdoptedTrainingProgramConcurrencyError();
    await expect(
      new StartProgramWorkoutOccurrenceUseCase(
        createExecutionPort({
          startProgramWorkout: jest.fn().mockRejectedValue(concurrencyFailure),
        }),
      ).execute({
        ownerId,
        adoptedTrainingProgramId: adoptedProgramId,
        occurrenceId,
        timezone: 'Asia/Qatar',
        startedAt: new Date('2026-08-31T10:00:00.000Z'),
      }),
    ).rejects.toBe(concurrencyFailure);
  });

  it('does not delegate start when an identifier is invalid', () => {
    const startProgramWorkout = jest.fn();
    expect(() =>
      new StartProgramWorkoutOccurrenceUseCase(
        createExecutionPort({ startProgramWorkout }),
      ).execute({
        ownerId: 'invalid-owner',
        adoptedTrainingProgramId: adoptedProgramId,
        occurrenceId,
        timezone: 'UTC',
      }),
    ).toThrow();
    expect(startProgramWorkout).not.toHaveBeenCalled();
  });
});
