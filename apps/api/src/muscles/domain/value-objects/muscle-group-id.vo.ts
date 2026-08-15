import { ExistingUuid } from '../../../modules/shared/domain/value-objects/existing-uuid.vo';
import { ValueObject } from '../../../modules/shared/domain/value-objects/value-object.vo';
import { MuscleValidationError } from '../errors/muscle.errors';

export class MuscleGroupId extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): MuscleGroupId {
    try {
      return new MuscleGroupId(ExistingUuid.create(value.trim()).value);
    } catch {
      throw new MuscleValidationError('Muscle group ID must be a valid UUID.');
    }
  }
}
