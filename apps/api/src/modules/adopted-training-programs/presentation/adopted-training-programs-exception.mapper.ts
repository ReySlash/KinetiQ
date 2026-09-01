import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  AdoptedTrainingProgramAlreadyNonTerminalError,
  AdoptedTrainingProgramConcurrencyError,
  AdoptedTrainingProgramEmptyScheduleError,
  AdoptedTrainingProgramNotFoundError,
  AdoptedTrainingProgramPersistenceError,
  AdoptedTrainingProgramQueryError,
  AdoptedTrainingProgramSourceNotFoundError,
  AdoptedTrainingProgramSourceUnavailableError,
} from '../application/errors/adopted-training-program.errors';
import {
  AdoptedTrainingProgramLifecycleError,
  AdoptedTrainingProgramValidationError,
  ProgramWorkoutOccurrenceLifecycleError,
  ProgramWorkoutOccurrenceValidationError,
} from '../domain/errors/adopted-training-program.errors';
import { WorkoutSessionValidationError } from '../../workout-sessions/domain/errors/workout-session.errors';

export function toAdoptedTrainingProgramsHttpException(error: unknown): Error {
  if (
    error instanceof AdoptedTrainingProgramNotFoundError ||
    error instanceof AdoptedTrainingProgramSourceNotFoundError
  ) {
    return withCode(NotFoundException, error);
  }
  if (
    error instanceof AdoptedTrainingProgramEmptyScheduleError ||
    error instanceof AdoptedTrainingProgramSourceUnavailableError
  ) {
    return withCode(UnprocessableEntityException, error);
  }
  if (
    error instanceof AdoptedTrainingProgramAlreadyNonTerminalError ||
    error instanceof AdoptedTrainingProgramConcurrencyError
  ) {
    return withCode(ConflictException, error);
  }
  if (
    error instanceof AdoptedTrainingProgramValidationError ||
    error instanceof AdoptedTrainingProgramLifecycleError ||
    error instanceof ProgramWorkoutOccurrenceValidationError ||
    error instanceof ProgramWorkoutOccurrenceLifecycleError ||
    error instanceof WorkoutSessionValidationError
  ) {
    return withCode(BadRequestException, error);
  }
  if (
    error instanceof AdoptedTrainingProgramPersistenceError ||
    error instanceof AdoptedTrainingProgramQueryError
  ) {
    return withCode(InternalServerErrorException, error);
  }
  return new InternalServerErrorException(
    'Adopted training program request failed.',
  );
}

function withCode(
  ExceptionType:
    | typeof BadRequestException
    | typeof ConflictException
    | typeof InternalServerErrorException
    | typeof NotFoundException
    | typeof UnprocessableEntityException,
  error: Error & { code?: string },
): Error {
  return new ExceptionType({
    message: error.message,
    ...(error.code ? { code: error.code } : {}),
  });
}
