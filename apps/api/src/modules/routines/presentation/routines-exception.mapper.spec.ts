import {
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  RoutineExerciseUnavailableError,
  RoutineListAuthenticationError,
  RoutineNotFoundError,
  RoutineInUseError,
  RoutinePersistenceError,
  RoutineQueryError,
} from '../application/errors/routine.errors';
import { RoutineValidationError } from '../domain/errors/routine.errors';
import { toRoutinesHttpException } from './routines-exception.mapper';

describe('toRoutinesHttpException', () => {
  it.each([
    [new RoutineNotFoundError(), NotFoundException],
    [new RoutineValidationError('Invalid routine'), BadRequestException],
    [new RoutineListAuthenticationError(), UnauthorizedException],
    [new RoutineExerciseUnavailableError(), UnprocessableEntityException],
    [new RoutineInUseError(), ConflictException],
    [new RoutinePersistenceError(), InternalServerErrorException],
    [new RoutineQueryError(), InternalServerErrorException],
    [new Error('unexpected'), InternalServerErrorException],
  ])('maps %s to %s', (error, exceptionType) => {
    expect(toRoutinesHttpException(error)).toBeInstanceOf(exceptionType);
  });
});
