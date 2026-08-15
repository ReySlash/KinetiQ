import { ValueObject } from '../../../modules/shared/domain/value-objects/value-object.vo';
import type { MuscleBodyRegion as MuscleBodyRegionType } from '../entities/muscle.types';
import { MuscleValidationError } from '../errors/muscle.errors';

const BODY_REGIONS = new Set<MuscleBodyRegionType>([
  'UPPER_BODY',
  'LOWER_BODY',
  'CORE',
  'FULL_BODY',
  'OTHER',
]);

export class MuscleBodyRegion extends ValueObject<MuscleBodyRegionType> {
  private constructor(value: MuscleBodyRegionType) {
    super(value);
  }

  static create(value: MuscleBodyRegionType): MuscleBodyRegion {
    if (!BODY_REGIONS.has(value)) {
      throw new MuscleValidationError('Muscle bodyRegion is invalid.');
    }

    return new MuscleBodyRegion(value);
  }
}
