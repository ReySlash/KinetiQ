import type {
  CreateTrainingProgramAttributes,
  PrimitiveTrainingProgram,
} from './training-program.types';
import { TrainingProgramDescription } from '../value-objects/training-program-description.vo';
import { TrainingProgramDuration } from '../value-objects/training-program-duration.vo';
import { TrainingProgramId } from '../value-objects/training-program-id.vo';
import { TrainingProgramName } from '../value-objects/training-program-name.vo';
import { TrainingProgramSlug } from '../value-objects/training-program-slug.vo';

export class TrainingProgram {
  public readonly id: string;
  public readonly ownerId: string;
  public readonly slug: string;
  public readonly name: string;
  public readonly description: string | null;
  public readonly visibility: PrimitiveTrainingProgram['visibility'];
  public readonly durationWeeks: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(attributes: PrimitiveTrainingProgram) {
    this.id = attributes.id;
    this.ownerId = attributes.ownerId;
    this.slug = attributes.slug;
    this.name = attributes.name;
    this.description = attributes.description;
    this.visibility = attributes.visibility;
    this.durationWeeks = attributes.durationWeeks;
    this.createdAt = attributes.createdAt;
    this.updatedAt = attributes.updatedAt;
  }

  static create(attributes: CreateTrainingProgramAttributes): TrainingProgram {
    const id = TrainingProgramId.create();
    const name = TrainingProgramName.create(attributes.name);
    const description = TrainingProgramDescription.create(
      attributes.description,
    );
    const duration = TrainingProgramDuration.create(attributes.durationWeeks);
    const slug = TrainingProgramSlug.create(attributes.slug, name, id);
    const now = new Date();

    return new TrainingProgram({
      id: id.value,
      ownerId: attributes.ownerId,
      slug: slug.value,
      name: name.value,
      description: description.value,
      visibility: 'PRIVATE',
      durationWeeks: duration.value,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(attributes: PrimitiveTrainingProgram): TrainingProgram {
    return new TrainingProgram(attributes);
  }

  toValue(): PrimitiveTrainingProgram {
    return {
      id: this.id,
      ownerId: this.ownerId,
      slug: this.slug,
      name: this.name,
      description: this.description,
      visibility: this.visibility,
      durationWeeks: this.durationWeeks,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
