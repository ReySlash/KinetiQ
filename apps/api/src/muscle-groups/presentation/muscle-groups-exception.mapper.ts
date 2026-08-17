import {
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  MuscleGroupNotFoundError,
  MuscleGroupQueryError,
} from '../application/errors/muscle-group.errors';

export function toMuscleGroupsHttpException(
  error: unknown,
  queryFailureMessage: string,
): HttpException {
  if (error instanceof MuscleGroupNotFoundError) {
    return new NotFoundException(error.message);
  }

  if (error instanceof MuscleGroupQueryError) {
    return new InternalServerErrorException(queryFailureMessage);
  }

  return new InternalServerErrorException('Muscle group request failed.');
}
