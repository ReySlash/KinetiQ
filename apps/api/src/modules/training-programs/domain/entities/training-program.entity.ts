import type {
  CreateTrainingProgramAttributes,
  PrimitiveTrainingProgram,
  UpdateTrainingProgramAttributes,
} from './training-program.types';
import { Entity } from '../../../shared/domain/entity';
import { UniqueId } from '../../../shared/domain/value-objects/unique-id.vo';
import { TrainingProgramDescription } from '../value-objects/training-program-description.vo';
import { TrainingProgramDuration } from '../value-objects/training-program-duration.vo';
import { TrainingProgramName } from '../value-objects/training-program-name.vo';
import { TrainingProgramSlug } from '../value-objects/training-program-slug.vo';
import { TrainingProgramScheduleValidationError } from '../errors/training-program.errors';
import { TrainingProgramScheduleEntry } from './training-program-schedule-entry.entity';

export class TrainingProgram extends Entity<UniqueId> {
  public readonly ownerId: string;
  public readonly slug: string;
  public readonly name: string;
  public readonly description: string | null;
  public readonly visibility: PrimitiveTrainingProgram['visibility'];
  public readonly durationWeeks: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly schedule: readonly TrainingProgramScheduleEntry[];

  private constructor(attributes: PrimitiveTrainingProgram) {
    super(UniqueId.create(attributes.id));
    this.ownerId = attributes.ownerId;
    this.slug = attributes.slug;
    this.name = attributes.name;
    this.description = attributes.description;
    this.visibility = attributes.visibility;
    this.durationWeeks = attributes.durationWeeks;
    this.createdAt = attributes.createdAt;
    this.updatedAt = attributes.updatedAt;
    this.schedule = attributes.schedule
      .map((entry) => TrainingProgramScheduleEntry.reconstitute(entry))
      .sort(
        (left, right) =>
          left.slot.weekNumber - right.slot.weekNumber ||
          left.slot.dayNumber - right.slot.dayNumber,
      );
    TrainingProgram.validateSchedule(this.schedule, this.durationWeeks);
  }

  private static validateSchedule(
    schedule: readonly TrainingProgramScheduleEntry[],
    durationWeeks: number,
  ): void {
    const occupiedSlots = new Set<string>();
    for (const entry of schedule) {
      if (entry.slot.weekNumber > durationWeeks) {
        throw new TrainingProgramScheduleValidationError(
          'Schedule weekNumber cannot exceed durationWeeks.',
        );
      }
      if (occupiedSlots.has(entry.slot.key)) {
        throw new TrainingProgramScheduleValidationError(
          `Only one routine can occupy week ${entry.slot.weekNumber}, day ${entry.slot.dayNumber}.`,
        );
      }
      occupiedSlots.add(entry.slot.key);
    }
  }

  static create(attributes: CreateTrainingProgramAttributes): TrainingProgram {
    const id = UniqueId.create();
    const name = TrainingProgramName.create(attributes.name);
    const description = TrainingProgramDescription.create(
      attributes.description,
    );
    const duration = TrainingProgramDuration.create(attributes.durationWeeks);
    const slug = TrainingProgramSlug.create(attributes.slug, name, id);
    const now = new Date();
    const schedule = (attributes.schedule ?? [])
      .map((entry) => TrainingProgramScheduleEntry.create(entry))
      .sort(
        (left, right) =>
          left.slot.weekNumber - right.slot.weekNumber ||
          left.slot.dayNumber - right.slot.dayNumber,
      );
    TrainingProgram.validateSchedule(schedule, duration.value);

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
      schedule: schedule.map((entry) => entry.toValue()),
    });
  }

  static reconstitute(attributes: PrimitiveTrainingProgram): TrainingProgram {
    return new TrainingProgram(attributes);
  }

  update(attributes: UpdateTrainingProgramAttributes): TrainingProgram {
    const name = TrainingProgramName.create(attributes.name ?? this.name);
    const description = TrainingProgramDescription.create(
      attributes.description === undefined
        ? this.description
        : attributes.description,
    );
    const duration = TrainingProgramDuration.create(
      attributes.durationWeeks ?? this.durationWeeks,
    );
    const schedule = (
      attributes.schedule === undefined
        ? this.schedule.map((entry) => entry.toValue())
        : attributes.schedule.map((entry) =>
            TrainingProgramScheduleEntry.create(entry).toValue(),
          )
    ).map((entry) => TrainingProgramScheduleEntry.reconstitute(entry));
    TrainingProgram.validateSchedule(schedule, duration.value);

    return new TrainingProgram({
      id: this.id.value,
      ownerId: this.ownerId,
      slug: this.slug,
      name: name.value,
      description: description.value,
      visibility: this.visibility,
      durationWeeks: duration.value,
      createdAt: this.createdAt,
      updatedAt: new Date(),
      schedule: schedule.map((entry) => entry.toValue()),
    });
  }

  toValue(): PrimitiveTrainingProgram {
    return {
      id: this.id.value,
      ownerId: this.ownerId,
      slug: this.slug,
      name: this.name,
      description: this.description,
      visibility: this.visibility,
      durationWeeks: this.durationWeeks,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      schedule: this.schedule.map((entry) => entry.toValue()),
    };
  }
}
