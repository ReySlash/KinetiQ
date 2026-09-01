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
import { toAdoptedTrainingProgramsHttpException } from './adopted-training-programs-exception.mapper';

describe('toAdoptedTrainingProgramsHttpException', () => {
  it.each([
    [new AdoptedTrainingProgramNotFoundError(), NotFoundException],
    [new AdoptedTrainingProgramSourceNotFoundError(), NotFoundException],
    [
      new AdoptedTrainingProgramEmptyScheduleError(),
      UnprocessableEntityException,
    ],
    [
      new AdoptedTrainingProgramSourceUnavailableError(),
      UnprocessableEntityException,
    ],
    [new AdoptedTrainingProgramAlreadyNonTerminalError(), ConflictException],
    [new AdoptedTrainingProgramConcurrencyError(), ConflictException],
    [new AdoptedTrainingProgramValidationError('invalid'), BadRequestException],
    [
      new AdoptedTrainingProgramPersistenceError(),
      InternalServerErrorException,
    ],
    [new AdoptedTrainingProgramQueryError(), InternalServerErrorException],
    [new Error('unexpected'), InternalServerErrorException],
  ])('maps errors to %s', (error, exceptionType) => {
    expect(toAdoptedTrainingProgramsHttpException(error)).toBeInstanceOf(
      exceptionType,
    );
  });

  it.each([
    new AdoptedTrainingProgramNotFoundError(),
    new AdoptedTrainingProgramEmptyScheduleError(),
    new AdoptedTrainingProgramSourceUnavailableError(),
    new AdoptedTrainingProgramAlreadyNonTerminalError(),
    new AdoptedTrainingProgramConcurrencyError(),
    new AdoptedTrainingProgramPersistenceError(),
    new AdoptedTrainingProgramQueryError(),
  ])(
    'preserves the stable application error code in the HTTP body',
    (error) => {
      // Failure mode: BV-05
      // Arrange
      const expectedCode = error.code;

      // Act
      const exception = toAdoptedTrainingProgramsHttpException(error);

      // Assert
      expect(exception).toBeInstanceOf(Error);
      expect(
        (exception as InstanceType<typeof BadRequestException>).getResponse(),
      ).toMatchObject({ code: expectedCode });
    },
  );

  it.each([
    [
      'ADOPTED_TRAINING_PROGRAM_SOURCE_NOT_FOUND',
      () => new AdoptedTrainingProgramSourceNotFoundError(),
    ],
    [
      'ADOPTED_TRAINING_PROGRAM_VALIDATION_FAILED',
      () => new AdoptedTrainingProgramValidationError('invalid program'),
    ],
    [
      'ADOPTED_TRAINING_PROGRAM_LIFECYCLE_FAILED',
      () =>
        new AdoptedTrainingProgramLifecycleError('invalid program transition'),
    ],
    [
      'PROGRAM_WORKOUT_OCCURRENCE_VALIDATION_FAILED',
      () => new ProgramWorkoutOccurrenceValidationError('invalid occurrence'),
    ],
    [
      'PROGRAM_WORKOUT_OCCURRENCE_LIFECYCLE_FAILED',
      () =>
        new ProgramWorkoutOccurrenceLifecycleError(
          'invalid occurrence transition',
        ),
    ],
  ])(
    'returns the confirmed stable code %s in the HTTP body',
    (expectedCode, createError) => {
      // Failure mode: BV-05
      // Arrange
      const error = createError();
      const expectedResponse = { code: expectedCode };

      // Act
      const exception = toAdoptedTrainingProgramsHttpException(error);

      // Assert
      expect(
        (exception as InstanceType<typeof BadRequestException>).getResponse(),
      ).toMatchObject(expectedResponse);
    },
  );
});
