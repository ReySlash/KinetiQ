import { ValueObject } from '../../../modules/shared/domain/value-objects/value-object.vo';
import { RoutineValidationError } from '../errors/routine.errors';

export class RoutineSlug extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(name: string, id: string): RoutineSlug {
    const base = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (!base) {
      throw new RoutineValidationError('Routine slug cannot be empty.');
    }
    return new RoutineSlug(`${base}-${id.slice(0, 8)}`);
  }

  static from(value: string): RoutineSlug {
    const normalized = value.trim();
    if (!normalized) {
      throw new RoutineValidationError('Routine slug cannot be empty.');
    }
    return new RoutineSlug(normalized);
  }
}
