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
import { WorkoutSessionValidationError } from '../domain/errors/workout-session.errors';
import { toWorkoutSessionsHttpException } from './workout-sessions-exception.mapper';

describe('toWorkoutSessionsHttpException', () => {
  it.each([
    [new WorkoutSessionNotFoundError(), NotFoundException],
    [new WorkoutSessionAlreadyActiveError(), ConflictException],
    [new WorkoutSessionConcurrencyError(), ConflictException],
    [new WorkoutSessionRoutineUnavailableError(), UnprocessableEntityException],
    [
      new WorkoutSessionExerciseUnavailableError(),
      UnprocessableEntityException,
    ],
    [new WorkoutSessionValidationError('Invalid workout'), BadRequestException],
    [new WorkoutSessionPersistenceError(), InternalServerErrorException],
    [new WorkoutSessionQueryError(), InternalServerErrorException],
    [new Error('unexpected'), InternalServerErrorException],
  ])('maps %s to %s', (error, exceptionType) => {
    expect(toWorkoutSessionsHttpException(error)).toBeInstanceOf(exceptionType);
  });
});
