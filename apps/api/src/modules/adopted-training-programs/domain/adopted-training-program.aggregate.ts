import { Entity } from '../../shared/domain/entity';
import { ExistingUuid } from '../../shared/domain/value-objects/existing-uuid.vo';
import { UniqueId } from '../../shared/domain/value-objects/unique-id.vo';
import {
  AdoptedTrainingProgramLifecycleError,
  AdoptedTrainingProgramValidationError,
} from './errors/adopted-training-program.errors';
import { AdoptedProgramNameSnapshot } from './value-objects/adopted-program-snapshot.vo';
import { AdoptedProgramDuration } from './value-objects/adopted-program-duration.vo';
import {
  AdoptedTrainingProgramStatus,
  type AdoptedTrainingProgramStatusValue,
} from './value-objects/adopted-training-program-status.vo';
import {
  ProgramWorkoutOccurrence,
  type CreateProgramWorkoutOccurrenceAttributes,
  type PrimitiveProgramWorkoutOccurrence,
} from './program-workout-occurrence.entity';

export type CreateAdoptedTrainingProgramAttributes = {
  ownerId: string;
  sourceTrainingProgramId?: string | null;
  programNameSnapshot: string;
  durationWeeksSnapshot: number;
  startedAt: Date;
  occurrences: readonly CreateProgramWorkoutOccurrenceAttributes[];
};

export type PrimitiveAdoptedTrainingProgram = {
  id: string;
  ownerId: string;
  sourceTrainingProgramId: string | null;
  programNameSnapshot: string;
  durationWeeksSnapshot: number;
  status: AdoptedTrainingProgramStatusValue;
  startedAt: Date;
  completedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  occurrences: PrimitiveProgramWorkoutOccurrence[];
};

type AdoptedTrainingProgramState = PrimitiveAdoptedTrainingProgram;

export class AdoptedTrainingProgram extends Entity<UniqueId> {
  private constructor(state: AdoptedTrainingProgramState) {
    super(UniqueId.create(state.id));
    this.ownerId = state.ownerId;
    this.sourceTrainingProgramId = state.sourceTrainingProgramId;
    this.programNameSnapshot = AdoptedProgramNameSnapshot.create(
      state.programNameSnapshot,
    ).value;
    this.durationWeeksSnapshot = AdoptedProgramDuration.create(
      state.durationWeeksSnapshot,
    ).value;
    this.status = AdoptedTrainingProgramStatus.create(state.status).value;
    this.startedAt = new Date(state.startedAt);
    this.completedAt = state.completedAt ? new Date(state.completedAt) : null;
    this.cancelledAt = state.cancelledAt ? new Date(state.cancelledAt) : null;
    this.createdAt = new Date(state.createdAt);
    this.updatedAt = new Date(state.updatedAt);
    this.occurrences = Object.freeze(
      state.occurrences
        .map((occurrence) => {
          const entity = ProgramWorkoutOccurrence.reconstitute(occurrence);
          if (entity.adoptedTrainingProgramId !== this.id.value) {
            throw new AdoptedTrainingProgramValidationError(
              'Occurrence belongs to a different adopted training program.',
            );
          }
          entity.assertWithinDuration(this.durationWeeksSnapshot);
          return entity;
        })
        .sort(
          (left, right) =>
            left.slot.weekNumber - right.slot.weekNumber ||
            left.slot.dayNumber - right.slot.dayNumber,
        ),
    );
    this.validateOccurrences(this.occurrences);
  }

  public readonly ownerId: string;
  public readonly sourceTrainingProgramId: string | null;
  public readonly programNameSnapshot: string;
  public readonly durationWeeksSnapshot: number;
  public readonly status: AdoptedTrainingProgramStatusValue;
  public readonly startedAt: Date;
  public readonly completedAt: Date | null;
  public readonly cancelledAt: Date | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly occurrences: readonly ProgramWorkoutOccurrence[];

  static create(
    attributes: CreateAdoptedTrainingProgramAttributes,
  ): AdoptedTrainingProgram {
    const id = UniqueId.create();
    const ownerId = ExistingUuid.create(attributes.ownerId).value;
    const sourceTrainingProgramId = attributes.sourceTrainingProgramId
      ? ExistingUuid.create(attributes.sourceTrainingProgramId).value
      : null;
    const duration = AdoptedProgramDuration.create(
      attributes.durationWeeksSnapshot,
    ).value;
    const startedAt = validDate(attributes.startedAt, 'Program start');
    if (attributes.occurrences.length === 0) {
      throw new AdoptedTrainingProgramValidationError(
        'An adopted training program must contain at least one occurrence.',
      );
    }
    const now = new Date();
    const occurrences = attributes.occurrences.map((occurrence) =>
      ProgramWorkoutOccurrence.create(id.value, occurrence).toValue(),
    );
    return new AdoptedTrainingProgram({
      id: id.value,
      ownerId,
      sourceTrainingProgramId,
      programNameSnapshot: attributes.programNameSnapshot,
      durationWeeksSnapshot: duration,
      status: 'ACTIVE',
      startedAt,
      completedAt: null,
      cancelledAt: null,
      createdAt: now,
      updatedAt: now,
      occurrences,
    });
  }

  static reconstitute(
    state: PrimitiveAdoptedTrainingProgram,
  ): AdoptedTrainingProgram {
    ExistingUuid.create(state.id);
    ExistingUuid.create(state.ownerId);
    if (state.sourceTrainingProgramId) {
      ExistingUuid.create(state.sourceTrainingProgramId);
    }
    validateLifecycleTimestamps(state);
    return new AdoptedTrainingProgram(state);
  }

  pause(): AdoptedTrainingProgram {
    this.assertTransition('ACTIVE', 'PAUSED');
    this.assertNoActiveOccurrence();
    return this.withState({ status: 'PAUSED' });
  }

  resume(): AdoptedTrainingProgram {
    this.assertTransition('PAUSED', 'ACTIVE');
    return this.withState({ status: 'ACTIVE' });
  }

  cancel(): AdoptedTrainingProgram {
    if (this.status !== 'ACTIVE' && this.status !== 'PAUSED') {
      throw new AdoptedTrainingProgramLifecycleError(
        `Cannot transition program from ${this.status} to CANCELLED.`,
      );
    }
    this.assertNoActiveOccurrence();
    return this.withState({ status: 'CANCELLED', cancelledAt: new Date() });
  }

  complete(): AdoptedTrainingProgram {
    if (this.status !== 'ACTIVE' && this.status !== 'PAUSED') {
      throw new AdoptedTrainingProgramLifecycleError(
        `Cannot transition program from ${this.status} to COMPLETED.`,
      );
    }
    if (
      this.occurrences.some(
        (occurrence) =>
          occurrence.status !== 'COMPLETED' && occurrence.status !== 'SKIPPED',
      )
    ) {
      throw new AdoptedTrainingProgramLifecycleError(
        'A program cannot complete while occurrences remain unresolved.',
      );
    }
    return this.withState({ status: 'COMPLETED', completedAt: new Date() });
  }

  nextPendingOccurrence(): ProgramWorkoutOccurrence | null {
    return (
      this.occurrences.find((occurrence) => occurrence.status === 'PENDING') ??
      null
    );
  }

  resolveOccurrence(
    occurrenceId: string,
    transition: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED',
  ): AdoptedTrainingProgram {
    const id = ExistingUuid.create(occurrenceId).value;
    const occurrence = this.occurrences.find((item) => item.id.value === id);
    if (!occurrence) {
      throw new AdoptedTrainingProgramValidationError(
        'Occurrence does not belong to this adopted training program.',
      );
    }
    const replacement =
      transition === 'IN_PROGRESS'
        ? occurrence.start()
        : transition === 'COMPLETED'
          ? occurrence.complete()
          : transition === 'SKIPPED'
            ? occurrence.skip()
            : occurrence.cancel();
    return this.withState({
      occurrences: this.occurrences.map((item) =>
        item.id.value === id ? replacement.toValue() : item.toValue(),
      ),
    });
  }

  toValue(): PrimitiveAdoptedTrainingProgram {
    return {
      id: this.id.value,
      ownerId: this.ownerId,
      sourceTrainingProgramId: this.sourceTrainingProgramId,
      programNameSnapshot: this.programNameSnapshot,
      durationWeeksSnapshot: this.durationWeeksSnapshot,
      status: this.status,
      startedAt: new Date(this.startedAt),
      completedAt: this.completedAt ? new Date(this.completedAt) : null,
      cancelledAt: this.cancelledAt ? new Date(this.cancelledAt) : null,
      createdAt: new Date(this.createdAt),
      updatedAt: new Date(this.updatedAt),
      occurrences: this.occurrences.map((occurrence) => occurrence.toValue()),
    };
  }

  private assertTransition(
    from: AdoptedTrainingProgramStatusValue,
    to: AdoptedTrainingProgramStatusValue,
  ): void {
    if (this.status !== from) {
      throw new AdoptedTrainingProgramLifecycleError(
        `Cannot transition program from ${this.status} to ${to}.`,
      );
    }
  }

  private assertNoActiveOccurrence(): void {
    if (
      this.occurrences.some((occurrence) => occurrence.status === 'IN_PROGRESS')
    ) {
      throw new AdoptedTrainingProgramLifecycleError(
        'Program lifecycle cannot change while an occurrence is in progress.',
      );
    }
  }

  private withState(
    changes: Partial<AdoptedTrainingProgramState>,
  ): AdoptedTrainingProgram {
    return new AdoptedTrainingProgram({
      ...this.toValue(),
      ...changes,
      updatedAt: new Date(),
    });
  }

  private validateOccurrences(
    occurrences: readonly ProgramWorkoutOccurrence[],
  ): void {
    const slots = new Set<string>();
    for (const occurrence of occurrences) {
      if (slots.has(occurrence.slot.key)) {
        throw new AdoptedTrainingProgramValidationError(
          `Only one occurrence can occupy week ${occurrence.slot.weekNumber}, day ${occurrence.slot.dayNumber}.`,
        );
      }
      slots.add(occurrence.slot.key);
    }
  }
}

function validDate(value: Date, label: string): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new AdoptedTrainingProgramValidationError(
      `${label} timestamp is invalid.`,
    );
  }
  return new Date(value);
}

function validateLifecycleTimestamps(
  state: PrimitiveAdoptedTrainingProgram,
): void {
  validDate(state.startedAt, 'Program start');
  if (state.completedAt) validDate(state.completedAt, 'Program completion');
  if (state.cancelledAt) validDate(state.cancelledAt, 'Program cancellation');
  const hasCompletedAt = state.completedAt !== null;
  const hasCancelledAt = state.cancelledAt !== null;
  if (
    (state.status === 'COMPLETED' && (!hasCompletedAt || hasCancelledAt)) ||
    (state.status === 'CANCELLED' && (!hasCancelledAt || hasCompletedAt)) ||
    (state.status !== 'COMPLETED' && hasCompletedAt) ||
    (state.status !== 'CANCELLED' && hasCancelledAt)
  ) {
    throw new AdoptedTrainingProgramValidationError(
      `Invalid lifecycle timestamps for ${state.status} adopted training program.`,
    );
  }
  if (state.completedAt && state.completedAt < state.startedAt) {
    throw new AdoptedTrainingProgramValidationError(
      'Program completion timestamp cannot precede the start timestamp.',
    );
  }
  if (state.cancelledAt && state.cancelledAt < state.startedAt) {
    throw new AdoptedTrainingProgramValidationError(
      'Program cancellation timestamp cannot precede the start timestamp.',
    );
  }
}
