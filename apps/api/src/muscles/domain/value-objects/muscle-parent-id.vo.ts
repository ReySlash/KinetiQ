import { ExistingUuid } from '../../../modules/shared/domain/value-objects/existing-uuid.vo';
import { ValueObject } from '../../../modules/shared/domain/value-objects/value-object.vo';
import { MuscleValidationError } from '../errors/muscle.errors';

export class MuscleParentId extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): MuscleParentId {
    try {
      return new MuscleParentId(ExistingUuid.create(value.trim()).value);
    } catch {
      throw new MuscleValidationError('Parent ID must be a valid UUID.');
    }
  }
}
