import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  ExerciseNameConflictError,
  ExerciseNotFoundError,
  ExercisePersistenceError,
  ExerciseQueryError,
  ExerciseRelatedRecordError,
  ExerciseSlugConflictError,
} from '../application/errors/exercise.errors';
import { ExerciseValidationError } from '../domain/errors/exercise.errors';

export function toExercisesHttpException(error: unknown): Error {
  if (error instanceof ExerciseNotFoundError) {
    return new NotFoundException(error.message);
  }
  if (
    error instanceof ExerciseValidationError ||
    error instanceof ExerciseNameConflictError ||
    error instanceof ExerciseSlugConflictError ||
    error instanceof ExerciseRelatedRecordError
  ) {
    return new BadRequestException(error.message);
  }
  if (error instanceof ExercisePersistenceError) {
    return new InternalServerErrorException('Failed to persist exercise.');
  }
  if (error instanceof ExerciseQueryError) {
    return new InternalServerErrorException('Failed to fetch exercises.');
  }
  return new InternalServerErrorException('Exercise request failed.');
}
