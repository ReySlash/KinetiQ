import { ValueObject } from '../../../modules/shared/domain/value-objects/value-object.vo';
import { MuscleGroupValidationError } from '../errors/muscle-group.errors';

export class MuscleGroupName extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): MuscleGroupName {
    const normalized = value.trim();
    if (normalized.length < 1 || normalized.length > 50) {
      throw new MuscleGroupValidationError(
        'Muscle group name must contain between 1 and 50 characters.',
      );
    }

    return new MuscleGroupName(
      normalized.charAt(0).toUpperCase() + normalized.slice(1),
    );
  }
}
