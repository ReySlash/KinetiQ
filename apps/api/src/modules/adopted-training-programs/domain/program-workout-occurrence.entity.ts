import { Entity } from '../../shared/domain/entity';
import { ExistingUuid } from '../../shared/domain/value-objects/existing-uuid.vo';
import { UniqueId } from '../../shared/domain/value-objects/unique-id.vo';
import {
  AdoptedTrainingProgramValidationError,
  ProgramWorkoutOccurrenceLifecycleError,
} from './errors/adopted-training-program.errors';
import {
  ProgramSlotNotesSnapshot,
  RoutineNameSnapshot,
} from './value-objects/adopted-program-snapshot.vo';
import { ProgramWorkoutOccurrenceStatus } from './value-objects/program-workout-occurrence-status.vo';
import { ProgramWorkoutSlot } from './value-objects/program-workout-slot.vo';

export type CreateProgramWorkoutOccurrenceAttributes = {
  sourceTrainingProgramRoutineId?: string | null;
  sourceRoutineId?: string | null;
  weekNumber: number;
  dayNumber: number;
  routineNameSnapshot: string;
  programSlotNotesSnapshot?: string | null;
};

export type PrimitiveProgramWorkoutOccurrence = {
  id: string;
  adoptedTrainingProgramId: string;
  sourceTrainingProgramRoutineId: string | null;
  sourceRoutineId: string | null;
  weekNumber: number;
  dayNumber: number;
  routineNameSnapshot: string;
  programSlotNotesSnapshot: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  createdAt: Date;
  updatedAt: Date;
};

type ProgramWorkoutOccurrenceState = PrimitiveProgramWorkoutOccurrence;

export class ProgramWorkoutOccurrence extends Entity<UniqueId> {
  private constructor(state: ProgramWorkoutOccurrenceState) {
    super(UniqueId.create(state.id));
    this.adoptedTrainingProgramId = state.adoptedTrainingProgramId;
    this.sourceTrainingProgramRoutineId = state.sourceTrainingProgramRoutineId;
    this.sourceRoutineId = state.sourceRoutineId;
    this.slot = ProgramWorkoutSlot.create(state.weekNumber, state.dayNumber);
    this.routineNameSnapshot = RoutineNameSnapshot.create(
      state.routineNameSnapshot,
    ).value;
    this.programSlotNotesSnapshot = ProgramSlotNotesSnapshot.create(
      state.programSlotNotesSnapshot,
    ).value;
    this.status = ProgramWorkoutOccurrenceStatus.create(state.status).value;
    this.createdAt = new Date(state.createdAt);
    this.updatedAt = new Date(state.updatedAt);
  }

  public readonly adoptedTrainingProgramId: string;
  public readonly sourceTrainingProgramRoutineId: string | null;
  public readonly sourceRoutineId: string | null;
  public readonly slot: ProgramWorkoutSlot;
  public readonly routineNameSnapshot: string;
  public readonly programSlotNotesSnapshot: string | null;
  public readonly status: PrimitiveProgramWorkoutOccurrence['status'];
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  static create(
    adoptedTrainingProgramId: string,
    attributes: CreateProgramWorkoutOccurrenceAttributes,
  ): ProgramWorkoutOccurrence {
    const parentId = ExistingUuid.create(adoptedTrainingProgramId).value;
    const now = new Date();
    return new ProgramWorkoutOccurrence({
      id: UniqueId.create().value,
      adoptedTrainingProgramId: parentId,
      sourceTrainingProgramRoutineId: attributes.sourceTrainingProgramRoutineId
        ? ExistingUuid.create(attributes.sourceTrainingProgramRoutineId).value
        : null,
      sourceRoutineId: attributes.sourceRoutineId
        ? ExistingUuid.create(attributes.sourceRoutineId).value
        : null,
      weekNumber: attributes.weekNumber,
      dayNumber: attributes.dayNumber,
      routineNameSnapshot: attributes.routineNameSnapshot,
      programSlotNotesSnapshot: attributes.programSlotNotesSnapshot ?? null,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(
    state: PrimitiveProgramWorkoutOccurrence,
  ): ProgramWorkoutOccurrence {
    return new ProgramWorkoutOccurrence({
      ...state,
      id: ExistingUuid.create(state.id).value,
      adoptedTrainingProgramId: ExistingUuid.create(
        state.adoptedTrainingProgramId,
      ).value,
      sourceTrainingProgramRoutineId: state.sourceTrainingProgramRoutineId
        ? ExistingUuid.create(state.sourceTrainingProgramRoutineId).value
        : null,
      sourceRoutineId: state.sourceRoutineId
        ? ExistingUuid.create(state.sourceRoutineId).value
        : null,
    });
  }

  start(): ProgramWorkoutOccurrence {
    return this.transition('PENDING', 'IN_PROGRESS');
  }

  complete(): ProgramWorkoutOccurrence {
    return this.transition('IN_PROGRESS', 'COMPLETED');
  }

  cancel(): ProgramWorkoutOccurrence {
    return this.transition('IN_PROGRESS', 'PENDING');
  }

  skip(): ProgramWorkoutOccurrence {
    return this.transition('PENDING', 'SKIPPED');
  }

  private transition(
    from: ProgramWorkoutOccurrence['status'],
    to: ProgramWorkoutOccurrence['status'],
  ): ProgramWorkoutOccurrence {
    if (this.status !== from) {
      throw new ProgramWorkoutOccurrenceLifecycleError(
        `Cannot transition occurrence from ${this.status} to ${to}.`,
      );
    }
    return new ProgramWorkoutOccurrence({
      ...this.toValue(),
      status: to,
      updatedAt: new Date(),
    });
  }

  toValue(): PrimitiveProgramWorkoutOccurrence {
    return {
      id: this.id.value,
      adoptedTrainingProgramId: this.adoptedTrainingProgramId,
      sourceTrainingProgramRoutineId: this.sourceTrainingProgramRoutineId,
      sourceRoutineId: this.sourceRoutineId,
      weekNumber: this.slot.weekNumber,
      dayNumber: this.slot.dayNumber,
      routineNameSnapshot: this.routineNameSnapshot,
      programSlotNotesSnapshot: this.programSlotNotesSnapshot,
      status: this.status,
      createdAt: new Date(this.createdAt),
      updatedAt: new Date(this.updatedAt),
    };
  }

  assertWithinDuration(durationWeeks: number): void {
    if (this.slot.weekNumber > durationWeeks) {
      throw new AdoptedTrainingProgramValidationError(
        'Occurrence weekNumber cannot exceed durationWeeksSnapshot.',
      );
    }
  }
}
