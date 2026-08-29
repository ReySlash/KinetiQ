import { ValueObject } from '../../../shared/domain/value-objects/value-object.vo';
import { AdoptedTrainingProgramValidationError } from '../errors/adopted-training-program.errors';

export type AdoptedTrainingProgramStatusValue =
  'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export class AdoptedTrainingProgramStatus extends ValueObject<AdoptedTrainingProgramStatusValue> {
  private constructor(value: AdoptedTrainingProgramStatusValue) {
    super(value);
  }

  static create(value: string): AdoptedTrainingProgramStatus {
    if (!['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'].includes(value)) {
      throw new AdoptedTrainingProgramValidationError(
        'Adopted training program status is invalid.',
      );
    }
    return new AdoptedTrainingProgramStatus(
      value as AdoptedTrainingProgramStatusValue,
    );
  }
}
