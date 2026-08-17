import { ValueObject } from '../../../modules/shared/domain/value-objects/value-object.vo';
import type { BodyRegion as BodyRegionValue } from '../entities/muscle-group.types';
import { MuscleGroupValidationError } from '../errors/muscle-group.errors';

const BODY_REGIONS = new Set<BodyRegionValue>([
  'UPPER_BODY',
  'LOWER_BODY',
  'CORE',
  'FULL_BODY',
  'OTHER',
]);

export class MuscleGroupBodyRegion extends ValueObject<BodyRegionValue> {
  private constructor(value: BodyRegionValue) {
    super(value);
  }

  static create(value: BodyRegionValue): MuscleGroupBodyRegion {
    if (!BODY_REGIONS.has(value)) {
      throw new MuscleGroupValidationError(
        'Muscle group bodyRegion is invalid.',
      );
    }

    return new MuscleGroupBodyRegion(value);
  }
}
