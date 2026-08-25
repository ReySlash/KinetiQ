import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  WorkoutSessionAlreadyActiveError,
  WorkoutSessionConcurrencyError,
  WorkoutSessionExerciseUnavailableError,
  WorkoutSessionNotFoundError,
  WorkoutSessionPersistenceError,
  WorkoutSessionQueryError,
  WorkoutSessionRoutineUnavailableError,
} from '../application/errors/workout-session.application.errors';
import {
  WorkoutSessionStateError,
  WorkoutSessionValidationError,
} from '../domain/errors/workout-session.errors';

export function toWorkoutSessionsHttpException(error: unknown): Error {
  if (error instanceof WorkoutSessionNotFoundError) {
    return new NotFoundException(error.message);
  }
  if (
    error instanceof WorkoutSessionAlreadyActiveError ||
    error instanceof WorkoutSessionConcurrencyError
  ) {
    return new ConflictException(error.message);
  }
  if (
    error instanceof WorkoutSessionRoutineUnavailableError ||
    error instanceof WorkoutSessionExerciseUnavailableError
  ) {
    return new UnprocessableEntityException(error.message);
  }
  if (
    error instanceof WorkoutSessionValidationError ||
    error instanceof WorkoutSessionStateError
  ) {
    return new BadRequestException(error.message);
  }
  if (
    error instanceof WorkoutSessionPersistenceError ||
    error instanceof WorkoutSessionQueryError
  ) {
    return new InternalServerErrorException(error.message);
  }
  return new InternalServerErrorException('Workout session request failed.');
}
