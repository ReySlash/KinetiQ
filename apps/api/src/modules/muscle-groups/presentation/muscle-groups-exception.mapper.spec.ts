import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  MuscleGroupNotFoundError,
  MuscleGroupQueryError,
} from '../application/errors/muscle-group.errors';
import { toMuscleGroupsHttpException } from './muscle-groups-exception.mapper';

describe('toMuscleGroupsHttpException', () => {
  it('maps not found errors to a 404 exception', () => {
    const exception = toMuscleGroupsHttpException(
      new MuscleGroupNotFoundError(),
      'Failed to fetch muscle group',
    );

    expect(exception).toBeInstanceOf(NotFoundException);
    expect(exception.getStatus()).toBe(404);
    expect(exception.message).toBe('Muscle group not found.');
  });

  it('maps query errors to a 500 exception with the supplied message', () => {
    const exception = toMuscleGroupsHttpException(
      new MuscleGroupQueryError(),
      'Failed to fetch muscle groups',
    );

    expect(exception).toBeInstanceOf(InternalServerErrorException);
    expect(exception.getStatus()).toBe(500);
    expect(exception.message).toBe('Failed to fetch muscle groups');
  });

  it('preserves the detail endpoint query failure message', () => {
    const exception = toMuscleGroupsHttpException(
      new MuscleGroupQueryError(),
      'Failed to fetch muscle group',
    );

    expect(exception.message).toBe('Failed to fetch muscle group');
  });

  it('maps unknown errors to a generic 500 exception', () => {
    const exception = toMuscleGroupsHttpException(
      new Error('unexpected failure'),
      'Failed to fetch muscle groups',
    );

    expect(exception).toBeInstanceOf(InternalServerErrorException);
    expect(exception.getStatus()).toBe(500);
    expect(exception.message).toBe('Muscle group request failed.');
  });
});
