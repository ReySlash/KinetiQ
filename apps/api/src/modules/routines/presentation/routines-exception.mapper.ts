import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  RoutineExerciseUnavailableError,
  RoutineInUseError,
  RoutineListAuthenticationError,
  RoutineNotFoundError,
  RoutinePersistenceError,
  RoutineQueryError,
} from '../application/errors/routine.errors';
import { RoutineValidationError } from '../domain/errors/routine.errors';

export function toRoutinesHttpException(error: unknown): Error {
  if (error instanceof RoutineNotFoundError) {
    return new NotFoundException(error.message);
  }
  if (error instanceof RoutineValidationError) {
    return new BadRequestException(error.message);
  }
  if (error instanceof RoutineListAuthenticationError) {
    return new UnauthorizedException(error.message);
  }
  if (error instanceof RoutineExerciseUnavailableError) {
    return new UnprocessableEntityException(error.message);
  }
  if (error instanceof RoutineInUseError) {
    return new ConflictException(error.message);
  }
  if (error instanceof RoutinePersistenceError) {
    return new InternalServerErrorException('Failed to persist routine.');
  }
  if (error instanceof RoutineQueryError) {
    return new InternalServerErrorException('Failed to fetch routines.');
  }
  return new InternalServerErrorException('Routine request failed.');
}
