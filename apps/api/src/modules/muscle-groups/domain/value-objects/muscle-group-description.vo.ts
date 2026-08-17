import { ValueObject } from '../../../shared/domain/value-objects/value-object.vo';
import { MuscleGroupValidationError } from '../errors/muscle-group.errors';

export class MuscleGroupDescription extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): MuscleGroupDescription {
    const normalized = value.trim();
    if (normalized.length < 1 || normalized.length > 200) {
      throw new MuscleGroupValidationError(
        'Muscle group description must contain between 1 and 200 characters.',
      );
    }

    return new MuscleGroupDescription(normalized);
  }
}
