import { ValueObject } from '../../../modules/shared/domain/value-objects/value-object.vo';
import { RoutineValidationError } from '../errors/routine.errors';

export class RoutineSets extends ValueObject<number> {
  private constructor(value: number) {
    super(value);
  }

  static create(value: number): RoutineSets {
    if (!Number.isInteger(value) || value < 1 || value > 20) {
      throw new RoutineValidationError(
        'Routine sets must be an integer between 1 and 20.',
      );
    }
    return new RoutineSets(value);
  }
}

export class RoutineReps extends ValueObject<number> {
  private constructor(value: number) {
    super(value);
  }

  static create(value: number, label: 'minimum' | 'maximum'): RoutineReps {
    if (!Number.isInteger(value) || value < 1 || value > 1000) {
      throw new RoutineValidationError(
        `Routine ${label} reps must be an integer between 1 and 1000.`,
      );
    }
    return new RoutineReps(value);
  }
}

export class RoutineTargetRir extends ValueObject<number> {
  private constructor(value: number) {
    super(value);
  }

  static create(value: number): RoutineTargetRir {
    if (!Number.isInteger(value) || value < 0 || value > 10) {
      throw new RoutineValidationError(
        'Routine target RIR must be an integer between 0 and 10.',
      );
    }
    return new RoutineTargetRir(value);
  }
}

export class RoutineRestSeconds extends ValueObject<number> {
  private constructor(value: number) {
    super(value);
  }

  static create(value: number): RoutineRestSeconds {
    if (!Number.isInteger(value) || value < 0 || value > 3600) {
      throw new RoutineValidationError(
        'Routine rest must be an integer between 0 and 3600 seconds.',
      );
    }
    return new RoutineRestSeconds(value);
  }
}

export class RoutineTempo extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): RoutineTempo {
    const normalized = value.trim();
    if (!/^(?:[0-9]|X)(?:-(?:[0-9]|X)){3}$/.test(normalized)) {
      throw new RoutineValidationError(
        'Routine tempo must contain four segments separated by hyphens.',
      );
    }
    return new RoutineTempo(normalized);
  }
}
