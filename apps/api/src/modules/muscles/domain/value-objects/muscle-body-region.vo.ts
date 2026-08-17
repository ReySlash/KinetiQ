import { ValueObject } from '../../../shared/domain/value-objects/value-object.vo';
import type { BodyRegion as MuscleBodyRegionType } from '../entities/muscle.types';
import { MuscleValidationError } from '../errors/muscle.errors';

const BODY_REGIONS = new Set<MuscleBodyRegionType>([
  'UPPER_BODY',
  'LOWER_BODY',
  'CORE',
  'FULL_BODY',
  'OTHER',
]);

export class BodyRegion extends ValueObject<MuscleBodyRegionType> {
  private constructor(value: MuscleBodyRegionType) {
    super(value);
  }

  static create(value: MuscleBodyRegionType): BodyRegion {
    if (!BODY_REGIONS.has(value)) {
      throw new MuscleValidationError('Muscle bodyRegion is invalid.');
    }

    return new BodyRegion(value);
  }
}
