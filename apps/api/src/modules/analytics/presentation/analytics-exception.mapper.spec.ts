import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  AnalyticsQueryError,
  AnalyticsValidationError,
} from '../application/errors/analytics.errors';
import { toAnalyticsHttpException } from './analytics-exception.mapper';

describe('toAnalyticsHttpException', () => {
  it.each([
    [new AnalyticsValidationError('invalid query'), BadRequestException],
    [new AnalyticsQueryError(), InternalServerErrorException],
    [new Error('unexpected'), InternalServerErrorException],
  ])('maps analytics failures to %s', (error, exceptionType) => {
    // Failure modes: NE-01, BV-05, BV-06
    // Arrange

    // Act
    const exception = toAnalyticsHttpException(error);

    // Assert
    expect(exception).toBeInstanceOf(exceptionType);
  });

  it('does not expose the underlying query failure message', () => {
    // Failure mode: BV-06
    // Arrange
    const error = new AnalyticsQueryError();

    // Act
    const exception = toAnalyticsHttpException(error);

    // Assert
    expect(
      (exception as InternalServerErrorException).getResponse(),
    ).toMatchObject({ message: 'Analytics data could not be loaded.' });
  });
});
