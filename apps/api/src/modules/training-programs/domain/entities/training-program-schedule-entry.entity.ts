import { randomUUID } from 'node:crypto';
import { TrainingProgramScheduleValidationError } from '../errors/training-program.errors';
import { TrainingProgramScheduleSlot } from '../value-objects/training-program-schedule-slot.vo';
import type {
  CreateTrainingProgramScheduleEntryAttributes,
  PrimitiveTrainingProgramScheduleEntry,
} from './training-program.types';

export class TrainingProgramScheduleEntry {
  private constructor(
    public readonly id: string,
    public readonly routineSlug: string,
    public readonly slot: TrainingProgramScheduleSlot,
    public readonly notes: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    attributes: CreateTrainingProgramScheduleEntryAttributes,
  ): TrainingProgramScheduleEntry {
    const routineSlug = attributes.routineSlug.trim();
    if (routineSlug.length < 1 || routineSlug.length > 120) {
      throw new TrainingProgramScheduleValidationError(
        'Schedule routineSlug must contain between 1 and 120 characters.',
      );
    }

    const notes = attributes.notes?.trim() || null;
    if (notes && notes.length > 1000) {
      throw new TrainingProgramScheduleValidationError(
        'Schedule notes must contain at most 1000 characters.',
      );
    }

    const now = new Date();
    return new TrainingProgramScheduleEntry(
      randomUUID(),
      routineSlug,
      TrainingProgramScheduleSlot.create(
        attributes.weekNumber,
        attributes.dayNumber,
      ),
      notes,
      now,
      now,
    );
  }

  static reconstitute(
    attributes: PrimitiveTrainingProgramScheduleEntry,
  ): TrainingProgramScheduleEntry {
    return new TrainingProgramScheduleEntry(
      attributes.id,
      attributes.routineSlug,
      TrainingProgramScheduleSlot.create(
        attributes.weekNumber,
        attributes.dayNumber,
      ),
      attributes.notes,
      attributes.createdAt,
      attributes.updatedAt,
    );
  }

  toValue(): PrimitiveTrainingProgramScheduleEntry {
    return {
      id: this.id,
      routineSlug: this.routineSlug,
      weekNumber: this.slot.weekNumber,
      dayNumber: this.slot.dayNumber,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
