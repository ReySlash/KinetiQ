import { Entity } from '../../../shared/domain/entity';
import { ExistingUuid } from '../../../shared/domain/value-objects/existing-uuid.vo';
import { UniqueId } from '../../../shared/domain/value-objects/unique-id.vo';
import { RoutineExercise } from '../value-objects/routine-exercise.vo';
import type {
  CreateRoutineAttributes,
  PrimitiveRoutine,
  UpdateRoutineAttributes,
} from './routine.types';
import {
  RoutineDescription,
  RoutineName,
} from '../value-objects/routine-text.vo';
import { RoutineSlug } from '../value-objects/routine-slug.vo';
import {
  RoutineVisibility,
  type RoutineVisibilityValue,
} from '../value-objects/routine-visibility.vo';

function optionalDescription(value: string | null | undefined): string | null {
  return value === undefined || value === null
    ? null
    : RoutineDescription.create(value).value;
}

function createExercises(
  exercises: CreateRoutineAttributes['exercises'],
): RoutineExercise[] {
  return exercises.map((exercise, order) =>
    RoutineExercise.create(exercise, order),
  );
}

export class Routine extends Entity<UniqueId> {
  public readonly ownerId: string;
  public readonly slug: string;
  public readonly name: string;
  public readonly description: string | null;
  public readonly visibility: RoutineVisibilityValue;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly exercises: RoutineExercise[];

  private constructor(attributes: PrimitiveRoutine) {
    super(UniqueId.create(attributes.id));
    this.ownerId = attributes.ownerId;
    this.slug = attributes.slug;
    this.name = attributes.name;
    this.description = attributes.description;
    this.visibility = attributes.visibility;
    this.createdAt = attributes.createdAt;
    this.updatedAt = attributes.updatedAt;
    this.exercises = attributes.exercises.map((exercise) =>
      RoutineExercise.reconstitute(exercise),
    );
  }

  static create(attributes: CreateRoutineAttributes): Routine {
    const id = UniqueId.create();
    const name = RoutineName.create(attributes.name).value;
    const ownerId = ExistingUuid.create(attributes.ownerId).value;

    return new Routine({
      id: id.value,
      ownerId,
      slug: RoutineSlug.create(name, id.value).value,
      name,
      description: optionalDescription(attributes.description),
      visibility: RoutineVisibility.create(attributes.visibility ?? 'PRIVATE')
        .value,
      createdAt: new Date(),
      updatedAt: new Date(),
      exercises: createExercises(attributes.exercises).map((exercise) =>
        exercise.toValue(),
      ),
    });
  }

  static reconstitute(attributes: PrimitiveRoutine): Routine {
    ExistingUuid.create(attributes.ownerId);
    RoutineName.create(attributes.name);
    RoutineSlug.from(attributes.slug);
    RoutineVisibility.create(attributes.visibility);
    return new Routine(attributes);
  }

  update(attributes: UpdateRoutineAttributes): Routine {
    const name =
      attributes.name === undefined
        ? this.name
        : RoutineName.create(attributes.name).value;
    const exercises =
      attributes.exercises === undefined
        ? this.exercises
        : createExercises(attributes.exercises);

    return new Routine({
      id: this.id.value,
      ownerId: this.ownerId,
      slug: this.slug,
      name,
      description:
        attributes.description === undefined
          ? this.description
          : optionalDescription(attributes.description),
      visibility: this.visibility,
      createdAt: this.createdAt,
      updatedAt: new Date(),
      exercises: exercises.map((exercise) => exercise.toValue()),
    });
  }

  toValue(): PrimitiveRoutine {
    return {
      id: this.id.value,
      ownerId: this.ownerId,
      slug: this.slug,
      name: this.name,
      description: this.description,
      visibility: this.visibility,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      exercises: this.exercises.map((exercise) => exercise.toValue()),
    };
  }
}
