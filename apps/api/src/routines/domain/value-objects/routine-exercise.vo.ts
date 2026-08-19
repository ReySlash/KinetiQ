import { UniqueId } from '../../../modules/shared/domain/value-objects/unique-id.vo';
import { ExistingUuid } from '../../../modules/shared/domain/value-objects/existing-uuid.vo';
import { ValueObject } from '../../../modules/shared/domain/value-objects/value-object.vo';
import { RoutineValidationError } from '../errors/routine.errors';
import {
  RoutineExerciseSlug,
  RoutineNotes,
} from '../value-objects/routine-text.vo';
import {
  RoutineReps,
  RoutineRestSeconds,
  RoutineSets,
  RoutineTargetRir,
  RoutineTempo,
} from '../value-objects/routine-prescription.vo';
import type {
  PrimitiveRoutineExercise,
  RoutineExerciseAttributes,
} from '../entities/routine.types';

function optionalText(
  value: string | null | undefined,
  create: (value: string) => { value: string },
): string | null {
  if (value === undefined || value === null) return null;
  const normalized = value.trim();
  return normalized.length === 0 ? null : create(normalized).value;
}

export class RoutineExercise extends ValueObject<PrimitiveRoutineExercise> {
  get id(): string {
    return this.value.id;
  }

  get exerciseSlug(): string {
    return this.value.exerciseSlug;
  }

  get order(): number {
    return this.value.order;
  }

  get sets(): number {
    return this.value.sets;
  }

  get minReps(): number {
    return this.value.minReps;
  }

  get maxReps(): number {
    return this.value.maxReps;
  }

  get targetRir(): number | null {
    return this.value.targetRir;
  }

  get restSeconds(): number | null {
    return this.value.restSeconds;
  }

  get tempo(): string | null {
    return this.value.tempo;
  }

  get notes(): string | null {
    return this.value.notes;
  }

  private constructor(attributes: PrimitiveRoutineExercise) {
    super({ ...attributes });
  }

  static create(
    attributes: RoutineExerciseAttributes,
    order: number,
  ): RoutineExercise {
    const minReps = RoutineReps.create(attributes.minReps, 'minimum').value;
    const maxReps = RoutineReps.create(attributes.maxReps, 'maximum').value;
    if (minReps > maxReps) {
      throw new RoutineValidationError(
        'Routine minimum reps must be less than or equal to maximum reps.',
      );
    }

    return new RoutineExercise({
      id: UniqueId.create().value,
      exerciseSlug: RoutineExerciseSlug.create(attributes.exerciseSlug).value,
      order,
      sets: RoutineSets.create(attributes.sets).value,
      minReps,
      maxReps,
      targetRir:
        attributes.targetRir === undefined || attributes.targetRir === null
          ? null
          : RoutineTargetRir.create(attributes.targetRir).value,
      restSeconds:
        attributes.restSeconds === undefined || attributes.restSeconds === null
          ? null
          : RoutineRestSeconds.create(attributes.restSeconds).value,
      tempo: optionalText(attributes.tempo, (value) =>
        RoutineTempo.create(value),
      ),
      notes: optionalText(attributes.notes, (value) =>
        RoutineNotes.create(value),
      ),
    });
  }

  static reconstitute(attributes: PrimitiveRoutineExercise): RoutineExercise {
    ExistingUuid.create(attributes.id);
    return new RoutineExercise(attributes);
  }

  toValue(): PrimitiveRoutineExercise {
    return { ...this.value };
  }
}
