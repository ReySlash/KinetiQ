import { ValueObject } from '../../../shared/domain/value-objects/value-object.vo';
import { AdoptedTrainingProgramValidationError } from '../errors/adopted-training-program.errors';

/**
 * Valid statuses for an adopted training program.
 * - ACTIVE: Program is currently in progress.
 * - PAUSED: Program is temporarily on hold.
 * - COMPLETED: Program has been finished.
 * - CANCELLED: Program was terminated before completion.
 */
export type AdoptedTrainingProgramStatusValue =
  'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export class AdoptedTrainingProgramStatus extends ValueObject<AdoptedTrainingProgramStatusValue> {
  private constructor(value: AdoptedTrainingProgramStatusValue) {
    super(value);
  }

  static create(value: string): AdoptedTrainingProgramStatus {
    if (!isAdoptedTrainingProgramStatus(value)) {
      throw new AdoptedTrainingProgramValidationError(
        'Adopted training program status is invalid.',
      );
    }
    return new AdoptedTrainingProgramStatus(value);
  }
}

function isAdoptedTrainingProgramStatus(
  value: string,
): value is AdoptedTrainingProgramStatusValue {
  return ['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'].includes(value);
}
