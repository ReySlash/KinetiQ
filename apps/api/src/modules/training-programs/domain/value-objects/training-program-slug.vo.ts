import type { UniqueId } from '../../../shared/domain/value-objects/unique-id.vo';
import type { TrainingProgramName } from './training-program-name.vo';
import { TrainingProgramValidationError } from '../errors/training-program.errors';

const MAX_SLUG_LENGTH = 120;
const GENERATED_SUFFIX_LENGTH = 9;

export class TrainingProgramSlug {
  private constructor(private readonly slug: string) {}

  static create(
    value: string | undefined,
    name: TrainingProgramName,
    id: UniqueId,
  ): TrainingProgramSlug {
    const base = TrainingProgramSlug.normalize(value?.trim() || name.value);
    if (!base) {
      throw new TrainingProgramValidationError(
        'Training program slug must contain alphanumeric characters.',
      );
    }
    const availableBaseLength = MAX_SLUG_LENGTH - GENERATED_SUFFIX_LENGTH;
    const shortenedBase = base.slice(0, availableBaseLength).replace(/-+$/, '');

    return new TrainingProgramSlug(`${shortenedBase}-${id.value.slice(0, 8)}`);
  }

  private static normalize(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  get value(): string {
    return this.slug;
  }
}
