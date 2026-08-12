import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  TrainingProgramPersistenceError,
  TrainingProgramQueryError,
  TrainingProgramNotFoundError,
  TrainingProgramListAuthenticationError,
  TrainingProgramRoutineUnavailableError,
  TrainingProgramScheduleConflictError,
  TrainingProgramSlugConflictError,
} from '../../application/errors/training-program.errors';
import {
  TrainingProgramScheduleValidationError,
  TrainingProgramValidationError,
} from '../../domain/errors/training-program.errors';

export function toTrainingProgramsHttpException(error: unknown): Error {
  if (error instanceof TrainingProgramNotFoundError) {
    return new NotFoundException(error.message);
  }
  if (error instanceof TrainingProgramValidationError) {
    return new BadRequestException(error.message);
  }
  if (error instanceof TrainingProgramScheduleValidationError) {
    return new UnprocessableEntityException(error.message);
  }
  if (error instanceof TrainingProgramRoutineUnavailableError) {
    return new UnprocessableEntityException(error.message);
  }
  if (error instanceof TrainingProgramListAuthenticationError) {
    return new UnauthorizedException(error.message);
  }
  if (error instanceof TrainingProgramScheduleConflictError) {
    return new ConflictException(error.message);
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
