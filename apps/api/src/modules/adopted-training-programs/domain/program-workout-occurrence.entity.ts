import { Entity } from '../../shared/domain/entity';
import { ExistingUuid } from '../../shared/domain/value-objects/existing-uuid.vo';
import { UniqueId } from '../../shared/domain/value-objects/unique-id.vo';
import {
  ProgramWorkoutOccurrenceLifecycleError,
  ProgramWorkoutOccurrenceValidationError,
} from './errors/adopted-training-program.errors';
import type {
  CreateProgramWorkoutOccurrenceAttributes,
  PrimitiveProgramWorkoutOccurrence,
} from './program-workout-occurrence.types';
import {
  ProgramSlotNotesSnapshot,
  RoutineNameSnapshot,
} from './value-objects/adopted-program-snapshot.vo';
import { AdoptedProgramTimestamp } from './value-objects/adopted-program-timestamp.vo';
import { ProgramWorkoutOccurrenceStatus } from './value-objects/program-workout-occurrence-status.vo';
import { ProgramWorkoutSlot } from './value-objects/program-workout-slot.vo';

export class ProgramWorkoutOccurrence extends Entity<UniqueId> {
  private constructor(state: PrimitiveProgramWorkoutOccurrence) {
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
    this.createdAtValue = AdoptedProgramTimestamp.create(state.createdAt);
    this.updatedAtValue = AdoptedProgramTimestamp.create(state.updatedAt);
    if (this.updatedAtValue.isBefore(this.createdAtValue)) {
      throw new ProgramWorkoutOccurrenceValidationError(
        'Occurrence updatedAt cannot precede createdAt.',
      );
    }
  }

  public readonly adoptedTrainingProgramId: string;
  public readonly sourceTrainingProgramRoutineId: string | null;
  public readonly sourceRoutineId: string | null;
  public readonly slot: ProgramWorkoutSlot;
  public readonly routineNameSnapshot: string;
  public readonly programSlotNotesSnapshot: string | null;
  public readonly status: PrimitiveProgramWorkoutOccurrence['status'];
  private readonly createdAtValue: AdoptedProgramTimestamp;
  private readonly updatedAtValue: AdoptedProgramTimestamp;

  get createdAt(): Date {
    return this.createdAtValue.toDate();
  }

  get updatedAt(): Date {
    return this.updatedAtValue.toDate();
  }

  static create(
    adoptedTrainingProgramId: string,
    attributes: CreateProgramWorkoutOccurrenceAttributes,
  ): ProgramWorkoutOccurrence {
    const parentId = ExistingUuid.create(adoptedTrainingProgramId).value;
    const now = new Date();
    return new ProgramWorkoutOccurrence({
      id: UniqueId.create().value,
      adoptedTrainingProgramId: parentId,
      sourceTrainingProgramRoutineId: createOptionalSourceId(
        attributes.sourceTrainingProgramRoutineId,
        'source training program routine',
      ),
      sourceRoutineId: createOptionalSourceId(
        attributes.sourceRoutineId,
        'source routine',
      ),
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
      sourceTrainingProgramRoutineId: createOptionalSourceId(
        state.sourceTrainingProgramRoutineId,
        'source training program routine',
      ),
      sourceRoutineId: createOptionalSourceId(
        state.sourceRoutineId,
        'source routine',
      ),
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
}

function createOptionalSourceId(
  value: string | null | undefined,
  label: string,
): string | null {
  if (!value) return null;
  try {
    return ExistingUuid.create(value).value;
  } catch {
    throw new ProgramWorkoutOccurrenceValidationError(
      `${label} identifier must be a valid UUID.`,
    );
  }
}
