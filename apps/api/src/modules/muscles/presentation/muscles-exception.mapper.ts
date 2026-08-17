import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  MuscleNameConflictError,
  MuscleNotFoundError,
  MusclePersistenceError,
  MuscleQueryError,
  MuscleSlugConflictError,
} from '../application/errors/muscle.errors';
import { MuscleValidationError } from '../domain/errors/muscle.errors';

export function toMusclesHttpException(error: unknown): Error {
  if (error instanceof MuscleNotFoundError) {
    return new NotFoundException(error.message);
  }
  if (error instanceof MuscleValidationError) {
    return new BadRequestException(error.message);
  }
  if (
    error instanceof MuscleNameConflictError ||
    error instanceof MuscleSlugConflictError
  ) {
    return new BadRequestException(error.message);
  }
  if (error instanceof MusclePersistenceError) {
    return new InternalServerErrorException('Failed to persist muscle.');
  }
  if (error instanceof MuscleQueryError) {
    return new InternalServerErrorException('Failed to fetch muscles.');
  }
  return new InternalServerErrorException('Muscle request failed.');
}
