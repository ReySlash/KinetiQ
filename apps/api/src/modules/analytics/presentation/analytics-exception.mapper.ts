import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  AnalyticsQueryError,
  AnalyticsValidationError,
} from '../application/errors/analytics.errors';

export function toAnalyticsHttpException(error: unknown): Error {
  if (error instanceof AnalyticsValidationError) {
    return new BadRequestException(error.message);
  }
  if (error instanceof AnalyticsQueryError) {
    return new InternalServerErrorException(
      'Analytics data could not be loaded.',
    );
  }
  return new InternalServerErrorException('Analytics request failed.');
}
