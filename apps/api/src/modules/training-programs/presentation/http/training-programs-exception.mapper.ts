import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  TrainingProgramPersistenceError,
  TrainingProgramQueryError,
  TrainingProgramSlugConflictError,
} from '../../application/errors/training-program.errors';
import { TrainingProgramValidationError } from '../../domain/errors/training-program.errors';

export function toTrainingProgramsHttpException(error: unknown): Error {
  if (error instanceof TrainingProgramValidationError) {
    return new BadRequestException(error.message);
  }
  if (error instanceof TrainingProgramSlugConflictError) {
    return new ConflictException(error.message);
  }
  if (error instanceof TrainingProgramPersistenceError) {
    return new InternalServerErrorException(
      'Failed to create training program.',
    );
  }
  if (error instanceof TrainingProgramQueryError) {
    return new InternalServerErrorException(
      'Failed to fetch training programs.',
    );
  }

  return new InternalServerErrorException('Training program request failed.');
}
