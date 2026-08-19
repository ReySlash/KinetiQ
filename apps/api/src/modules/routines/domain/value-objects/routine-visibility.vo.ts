import { ValueObject } from '../../../shared/domain/value-objects/value-object.vo';
import { RoutineValidationError } from '../errors/routine.errors';

export type RoutineVisibilityValue = 'PRIVATE' | 'GLOBAL';

export class RoutineVisibility extends ValueObject<RoutineVisibilityValue> {
  private constructor(value: RoutineVisibilityValue) {
    super(value);
  }

  static create(value: RoutineVisibilityValue): RoutineVisibility {
    if (value !== 'PRIVATE' && value !== 'GLOBAL') {
      throw new RoutineValidationError('Routine visibility is invalid.');
    }
    return new RoutineVisibility(value);
  }
}
