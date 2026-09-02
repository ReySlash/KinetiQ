import type { AdoptedTrainingProgram } from '../../domain/adopted-training-program.aggregate';
import type {
  AdoptTrainingProgramInput,
  AdoptTrainingProgramResult,
  AdoptedTrainingProgramCommandResult,
  AdoptedTrainingProgramLifecycleInput,
  SkipProgramWorkoutOccurrenceInput,
  StartProgramWorkoutOccurrenceInput,
  StartProgramWorkoutOccurrenceResult,
} from '../models/adopted-training-program-command.input';
import type { AdoptedTrainingProgramDetail } from '../models/adopted-training-program-detail.model';
import type { AdoptedTrainingProgramExecutionPort } from '../ports/adopted-training-program-execution.port';
import type { AdoptedTrainingProgramsCommandPort } from '../ports/adopted-training-programs-command.port';
import type { AdoptedTrainingProgramsQueryPort } from '../ports/adopted-training-programs-query.port';

const defaultStartResult: StartProgramWorkoutOccurrenceResult = {
  workoutSessionId: '00000000-0000-4000-8000-000000000000',
  occurrenceId: '00000000-0000-4000-8000-000000000000',
  sessionStatus: 'IN_PROGRESS',
  occurrenceStatus: 'IN_PROGRESS',
};

function unexpectedCommand<TResult, TArgs extends unknown[]>(
  name: string,
): jest.MockedFunction<(...args: TArgs) => Promise<TResult>> {
  return jest
    .fn<Promise<TResult>, TArgs>()
    .mockRejectedValue(new Error(`Unexpected ${name} command invocation.`));
}

type CommandPortDouble = {
  adopt: jest.MockedFunction<
    (input: AdoptTrainingProgramInput) => Promise<AdoptTrainingProgramResult>
  >;
  create: jest.MockedFunction<
    (program: AdoptedTrainingProgram) => Promise<void>
  >;
  pause: jest.MockedFunction<
    (
      input: AdoptedTrainingProgramLifecycleInput,
    ) => Promise<AdoptedTrainingProgramCommandResult>
  >;
  resume: jest.MockedFunction<
    (
      input: AdoptedTrainingProgramLifecycleInput,
    ) => Promise<AdoptedTrainingProgramCommandResult>
  >;
  cancel: jest.MockedFunction<
    (
      input: AdoptedTrainingProgramLifecycleInput,
    ) => Promise<AdoptedTrainingProgramCommandResult>
  >;
  skipOccurrence: jest.MockedFunction<
    (
      input: SkipProgramWorkoutOccurrenceInput,
    ) => Promise<AdoptedTrainingProgramCommandResult>
  >;
};

export function createCommandPort(
  overrides: Partial<CommandPortDouble> = {},
): AdoptedTrainingProgramsCommandPort & CommandPortDouble {
  return {
    adopt: unexpectedCommand<
      AdoptTrainingProgramResult,
      [AdoptTrainingProgramInput]
    >('adopt'),
    create: unexpectedCommand<void, [AdoptedTrainingProgram]>('create'),
    pause: unexpectedCommand<
      AdoptedTrainingProgramCommandResult,
      [AdoptedTrainingProgramLifecycleInput]
    >('pause'),
    resume: unexpectedCommand<
      AdoptedTrainingProgramCommandResult,
      [AdoptedTrainingProgramLifecycleInput]
    >('resume'),
    cancel: unexpectedCommand<
      AdoptedTrainingProgramCommandResult,
      [AdoptedTrainingProgramLifecycleInput]
    >('cancel'),
    skipOccurrence: unexpectedCommand<
      AdoptedTrainingProgramCommandResult,
      [SkipProgramWorkoutOccurrenceInput]
    >('skipOccurrence'),
    ...overrides,
  };
}

type QueryPortDouble = {
  findNonTerminalByOwner: jest.MockedFunction<
    (ownerId: string) => Promise<AdoptedTrainingProgramDetail | null>
  >;
  findOwnedDetailById: jest.MockedFunction<
    (
      adoptedTrainingProgramId: string,
      ownerId: string,
    ) => Promise<AdoptedTrainingProgramDetail | null>
  >;
};

export function createQueryPort(
  overrides: Partial<QueryPortDouble> = {},
): AdoptedTrainingProgramsQueryPort & QueryPortDouble {
  return {
    findNonTerminalByOwner: jest.fn().mockResolvedValue(null),
    findOwnedDetailById: jest.fn().mockResolvedValue(null),
    ...overrides,
  };
}

type ExecutionPortDouble = {
  startProgramWorkout: jest.MockedFunction<
    (
      input: StartProgramWorkoutOccurrenceInput,
    ) => Promise<StartProgramWorkoutOccurrenceResult>
  >;
};

export function createExecutionPort(
  overrides: Partial<ExecutionPortDouble> = {},
): AdoptedTrainingProgramExecutionPort & ExecutionPortDouble {
  return {
    startProgramWorkout: jest.fn().mockResolvedValue(defaultStartResult),
    ...overrides,
  };
}
