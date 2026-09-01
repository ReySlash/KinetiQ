import { Entity } from '../../shared/domain/entity';
import { ExistingUuid } from '../../shared/domain/value-objects/existing-uuid.vo';
import { UniqueId } from '../../shared/domain/value-objects/unique-id.vo';
import {
  AdoptedTrainingProgramLifecycleError,
  AdoptedTrainingProgramValidationError,
} from './errors/adopted-training-program.errors';
import type {
  CreateAdoptedTrainingProgramAttributes,
  PrimitiveAdoptedTrainingProgram,
} from './adopted-training-program.types';
import { AdoptedProgramNameSnapshot } from './value-objects/adopted-program-snapshot.vo';
import { AdoptedProgramDuration } from './value-objects/adopted-program-duration.vo';
import { AdoptedProgramTimestamp } from './value-objects/adopted-program-timestamp.vo';
import {
  AdoptedTrainingProgramStatus,
  type AdoptedTrainingProgramStatusValue,
} from './value-objects/adopted-training-program-status.vo';
import { ProgramWorkoutOccurrence } from './program-workout-occurrence.entity';

type AdoptedTrainingProgramAttributes = {
  id: UniqueId;
  ownerId: ExistingUuid;
  sourceTrainingProgramId: ExistingUuid | null;
  programNameSnapshot: AdoptedProgramNameSnapshot;
  durationWeeksSnapshot: AdoptedProgramDuration;
  status: AdoptedTrainingProgramStatus;
  startedAt: AdoptedProgramTimestamp;
  completedAt: AdoptedProgramTimestamp | null;
  cancelledAt: AdoptedProgramTimestamp | null;
  createdAt: AdoptedProgramTimestamp;
  updatedAt: AdoptedProgramTimestamp;
  occurrences: readonly ProgramWorkoutOccurrence[];
};

type AdoptedTrainingProgramChanges = Partial<
  Omit<PrimitiveAdoptedTrainingProgram, 'occurrences'>
> & {
  occurrences?: readonly ProgramWorkoutOccurrence[];
};

export class AdoptedTrainingProgram extends Entity<UniqueId> {
  private constructor(attributes: AdoptedTrainingProgramAttributes) {
    super(attributes.id);
    this.ownerId = attributes.ownerId.value;
    this.sourceTrainingProgramId =
      attributes.sourceTrainingProgramId?.value ?? null;
    this.programNameSnapshot = attributes.programNameSnapshot.value;
    this.durationWeeksSnapshot = attributes.durationWeeksSnapshot.value;
    this.status = attributes.status.value;
    this.startedAtValue = attributes.startedAt;
    this.completedAtValue = attributes.completedAt;
    this.cancelledAtValue = attributes.cancelledAt;
    this.createdAtValue = attributes.createdAt;
    this.updatedAtValue = attributes.updatedAt;
    this.occurrences = attributes.occurrences;
  }

  public readonly ownerId: string;
  public readonly sourceTrainingProgramId: string | null;
  public readonly programNameSnapshot: string;
  public readonly durationWeeksSnapshot: number;
  public readonly status: AdoptedTrainingProgramStatusValue;
  private readonly startedAtValue: AdoptedProgramTimestamp;
  private readonly completedAtValue: AdoptedProgramTimestamp | null;
  private readonly cancelledAtValue: AdoptedProgramTimestamp | null;
  private readonly createdAtValue: AdoptedProgramTimestamp;
  private readonly updatedAtValue: AdoptedProgramTimestamp;
  public readonly occurrences: readonly ProgramWorkoutOccurrence[];

  get startedAt(): Date {
    return this.startedAtValue.toDate();
  }

  get completedAt(): Date | null {
    return this.completedAtValue?.toDate() ?? null;
  }

  get cancelledAt(): Date | null {
    return this.cancelledAtValue?.toDate() ?? null;
  }

  get createdAt(): Date {
    return this.createdAtValue.toDate();
  }

  get updatedAt(): Date {
    return this.updatedAtValue.toDate();
  }

  static create(
    attributes: CreateAdoptedTrainingProgramAttributes,
  ): AdoptedTrainingProgram {
    const id = UniqueId.create();
    const createdAt = AdoptedProgramTimestamp.create(new Date());
    const durationWeeksSnapshot = AdoptedProgramDuration.create(
      attributes.durationWeeksSnapshot,
    );
    const occurrences = createOccurrences(id, attributes);
    const prepared = {
      id,
      ownerId: ExistingUuid.create(attributes.ownerId),
      sourceTrainingProgramId: createOptionalUuid(
        attributes.sourceTrainingProgramId,
      ),
      programNameSnapshot: AdoptedProgramNameSnapshot.create(
        attributes.programNameSnapshot,
      ),
      durationWeeksSnapshot,
      status: AdoptedTrainingProgramStatus.create('ACTIVE'),
      startedAt: AdoptedProgramTimestamp.create(attributes.startedAt),
      completedAt: null,
      cancelledAt: null,
      createdAt,
      updatedAt: createdAt,
      occurrences,
    } satisfies AdoptedTrainingProgramAttributes;
    validateAggregateState(prepared);
    return new AdoptedTrainingProgram(prepared);
  }

  static reconstitute(
    state: PrimitiveAdoptedTrainingProgram,
  ): AdoptedTrainingProgram {
    const prepared = {
      id: UniqueId.create(state.id),
      ownerId: ExistingUuid.create(state.ownerId),
      sourceTrainingProgramId: createOptionalUuid(
        state.sourceTrainingProgramId,
      ),
      programNameSnapshot: AdoptedProgramNameSnapshot.create(
        state.programNameSnapshot,
      ),
      durationWeeksSnapshot: AdoptedProgramDuration.create(
        state.durationWeeksSnapshot,
      ),
      status: AdoptedTrainingProgramStatus.create(state.status),
      startedAt: AdoptedProgramTimestamp.create(state.startedAt),
      completedAt: state.completedAt
        ? AdoptedProgramTimestamp.create(state.completedAt)
        : null,
      cancelledAt: state.cancelledAt
        ? AdoptedProgramTimestamp.create(state.cancelledAt)
        : null,
      createdAt: AdoptedProgramTimestamp.create(state.createdAt),
      updatedAt: AdoptedProgramTimestamp.create(state.updatedAt),
      occurrences: reconstituteOccurrences(state.occurrences),
    } satisfies AdoptedTrainingProgramAttributes;
    validateAggregateState(prepared);
    return new AdoptedTrainingProgram(prepared);
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

  startOccurrence(occurrenceId: string): AdoptedTrainingProgram {
    this.assertActiveForOccurrenceCommand();
    this.assertNextPendingOccurrence(occurrenceId);
    return this.replaceOccurrence(occurrenceId, (occurrence) =>
      occurrence.start(),
    );
  }

  completeOccurrence(occurrenceId: string): AdoptedTrainingProgram {
    this.assertCanResolveOccurrence();
    return this.resolveOccurrence(occurrenceId, (occurrence) =>
      occurrence.complete(),
    );
  }

  cancelOccurrence(occurrenceId: string): AdoptedTrainingProgram {
    this.assertCanResolveOccurrence();
    return this.replaceOccurrence(occurrenceId, (occurrence) =>
      occurrence.cancel(),
    );
  }

  skipOccurrence(occurrenceId: string): AdoptedTrainingProgram {
    this.assertActiveForOccurrenceCommand();
    this.assertNextPendingOccurrence(occurrenceId);
    return this.resolveOccurrence(occurrenceId, (occurrence) =>
      occurrence.skip(),
    );
  }

  nextPendingOccurrence(): ProgramWorkoutOccurrence | null {
    return (
      this.occurrences.find((occurrence) => occurrence.status === 'PENDING') ??
      null
    );
  }

  private replaceOccurrence(
    occurrenceId: string,
    operation: (
      occurrence: ProgramWorkoutOccurrence,
    ) => ProgramWorkoutOccurrence,
  ): AdoptedTrainingProgram {
    const id = ExistingUuid.create(occurrenceId).value;
    const occurrence = this.occurrences.find((item) => item.id.value === id);
    if (!occurrence) {
      throw new AdoptedTrainingProgramValidationError(
        'Occurrence does not belong to this adopted training program.',
      );
    }
    const replacement = operation(occurrence);
    return this.withState({
      occurrences: this.occurrences.map((item) =>
        item.id.value === id ? replacement : item,
      ),
    });
  }

  private resolveOccurrence(
    occurrenceId: string,
    operation: (
      occurrence: ProgramWorkoutOccurrence,
    ) => ProgramWorkoutOccurrence,
  ): AdoptedTrainingProgram {
    const id = ExistingUuid.create(occurrenceId).value;
    const occurrence = this.occurrences.find((item) => item.id.value === id);
    if (!occurrence) {
      throw new AdoptedTrainingProgramValidationError(
        'Occurrence does not belong to this adopted training program.',
      );
    }
    const occurrences = this.occurrences.map((item) =>
      item.id.value === id ? operation(item) : item,
    );
    const isComplete = occurrences.every(
      (occurrence) =>
        occurrence.status === 'COMPLETED' || occurrence.status === 'SKIPPED',
    );
    return this.withState({
      occurrences,
      ...(isComplete
        ? { status: 'COMPLETED' as const, completedAt: new Date() }
        : {}),
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

  private assertActiveForOccurrenceCommand(): void {
    if (this.status !== 'ACTIVE') {
      throw new AdoptedTrainingProgramLifecycleError(
        `Occurrence command requires an ACTIVE program, not ${this.status}.`,
      );
    }
  }

  private assertCanResolveOccurrence(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'PAUSED') {
      throw new AdoptedTrainingProgramLifecycleError(
        `Occurrence command cannot run for a ${this.status} program.`,
      );
    }
  }

  private assertNextPendingOccurrence(occurrenceId: string): void {
    const requestedId = ExistingUuid.create(occurrenceId).value;
    const nextPendingOccurrence = this.nextPendingOccurrence();
    if (
      !nextPendingOccurrence ||
      nextPendingOccurrence.id.value !== requestedId
    ) {
      throw new AdoptedTrainingProgramLifecycleError(
        'Only the next pending occurrence can be started or skipped.',
      );
    }
  }

  private withState(
    changes: AdoptedTrainingProgramChanges,
  ): AdoptedTrainingProgram {
    const { occurrences: changedOccurrences, ...scalarChanges } = changes;
    const attributes = {
      id: this.id,
      ownerId: ExistingUuid.create(this.ownerId),
      sourceTrainingProgramId: createOptionalUuid(
        scalarChanges.sourceTrainingProgramId ?? this.sourceTrainingProgramId,
      ),
      programNameSnapshot: AdoptedProgramNameSnapshot.create(
        scalarChanges.programNameSnapshot ?? this.programNameSnapshot,
      ),
      durationWeeksSnapshot: AdoptedProgramDuration.create(
        scalarChanges.durationWeeksSnapshot ?? this.durationWeeksSnapshot,
      ),
      status: AdoptedTrainingProgramStatus.create(
        scalarChanges.status ?? this.status,
      ),
      startedAt: AdoptedProgramTimestamp.create(
        scalarChanges.startedAt ?? this.startedAt,
      ),
      completedAt:
        scalarChanges.completedAt === undefined
          ? this.completedAtValue
          : scalarChanges.completedAt
            ? AdoptedProgramTimestamp.create(scalarChanges.completedAt)
            : null,
      cancelledAt:
        scalarChanges.cancelledAt === undefined
          ? this.cancelledAtValue
          : scalarChanges.cancelledAt
            ? AdoptedProgramTimestamp.create(scalarChanges.cancelledAt)
            : null,
      createdAt: this.createdAtValue,
      updatedAt: AdoptedProgramTimestamp.create(new Date()),
      occurrences: Object.freeze(changedOccurrences ?? this.occurrences),
    } satisfies AdoptedTrainingProgramAttributes;
    validateAggregateState(attributes);
    return new AdoptedTrainingProgram(attributes);
  }
}

function createOptionalUuid(
  value: string | null | undefined,
): ExistingUuid | null {
  return value ? ExistingUuid.create(value) : null;
}

function createOccurrences(
  id: UniqueId,
  attributes: CreateAdoptedTrainingProgramAttributes,
): readonly ProgramWorkoutOccurrence[] {
  const occurrences = attributes.occurrences
    .map((occurrence) => ProgramWorkoutOccurrence.create(id.value, occurrence))
    .sort(compareOccurrences);
  return Object.freeze(occurrences);
}

function reconstituteOccurrences(
  occurrences: PrimitiveAdoptedTrainingProgram['occurrences'],
): readonly ProgramWorkoutOccurrence[] {
  return Object.freeze(
    occurrences
      .map((occurrence) => ProgramWorkoutOccurrence.reconstitute(occurrence))
      .sort(compareOccurrences),
  );
}

function validateAggregateState(
  attributes: AdoptedTrainingProgramAttributes,
): void {
  if (attributes.updatedAt.isBefore(attributes.createdAt)) {
    throw new AdoptedTrainingProgramValidationError(
      'Program updatedAt cannot precede createdAt.',
    );
  }
  validateOccurrences(
    attributes.occurrences,
    attributes.durationWeeksSnapshot,
    attributes.id.value,
  );
  validateLifecycleTimestamps(
    attributes.status.value,
    attributes.startedAt,
    attributes.completedAt,
    attributes.cancelledAt,
  );
  validateParentChildLifecycle(attributes.status.value, attributes.occurrences);
}

function validateParentChildLifecycle(
  status: AdoptedTrainingProgramStatusValue,
  occurrences: readonly ProgramWorkoutOccurrence[],
): void {
  const hasUnresolvedOccurrence = occurrences.some(
    (occurrence) =>
      occurrence.status !== 'COMPLETED' && occurrence.status !== 'SKIPPED',
  );
  const hasActiveOccurrence = occurrences.some(
    (occurrence) => occurrence.status === 'IN_PROGRESS',
  );
  if (status === 'COMPLETED' && hasUnresolvedOccurrence) {
    throw new AdoptedTrainingProgramValidationError(
      'A completed program cannot contain unresolved occurrences.',
    );
  }
  if (status === 'CANCELLED' && hasActiveOccurrence) {
    throw new AdoptedTrainingProgramValidationError(
      'A cancelled program cannot contain an active occurrence.',
    );
  }
  if (status === 'ACTIVE' && !hasUnresolvedOccurrence) {
    throw new AdoptedTrainingProgramValidationError(
      'An active program cannot contain only resolved occurrences.',
    );
  }
}

function validateOccurrences(
  occurrences: readonly ProgramWorkoutOccurrence[],
  duration: AdoptedProgramDuration,
  adoptedTrainingProgramId?: string,
): void {
  if (occurrences.length === 0) {
    throw new AdoptedTrainingProgramValidationError(
      'An adopted training program must contain at least one occurrence.',
    );
  }
  const slots = new Set<string>();
  for (const occurrence of occurrences) {
    if (
      adoptedTrainingProgramId &&
      occurrence.adoptedTrainingProgramId !== adoptedTrainingProgramId
    ) {
      throw new AdoptedTrainingProgramValidationError(
        'Occurrence belongs to a different adopted training program.',
      );
    }
    if (!duration.containsWeek(occurrence.slot.weekNumber)) {
      throw new AdoptedTrainingProgramValidationError(
        'Occurrence weekNumber cannot exceed durationWeeksSnapshot.',
      );
    }
    if (slots.has(occurrence.slot.key)) {
      throw new AdoptedTrainingProgramValidationError(
        `Only one occurrence can occupy week ${occurrence.slot.weekNumber}, day ${occurrence.slot.dayNumber}.`,
      );
    }
    slots.add(occurrence.slot.key);
  }
}

function compareOccurrences(
  left: ProgramWorkoutOccurrence,
  right: ProgramWorkoutOccurrence,
): number {
  return (
    left.slot.weekNumber - right.slot.weekNumber ||
    left.slot.dayNumber - right.slot.dayNumber
  );
}

function validateLifecycleTimestamps(
  status: AdoptedTrainingProgramStatusValue,
  startedAt: AdoptedProgramTimestamp,
  completedAt: AdoptedProgramTimestamp | null,
  cancelledAt: AdoptedProgramTimestamp | null,
): void {
  const hasCompletedAt = completedAt !== null;
  const hasCancelledAt = cancelledAt !== null;
  if (
    (status === 'COMPLETED' && (!hasCompletedAt || hasCancelledAt)) ||
    (status === 'CANCELLED' && (!hasCancelledAt || hasCompletedAt)) ||
    (status !== 'COMPLETED' && hasCompletedAt) ||
    (status !== 'CANCELLED' && hasCancelledAt)
  ) {
    throw new AdoptedTrainingProgramValidationError(
      `Invalid lifecycle timestamps for ${status} adopted training program.`,
    );
  }
  if (completedAt?.isBefore(startedAt)) {
    throw new AdoptedTrainingProgramValidationError(
      'Program completion timestamp cannot precede the start timestamp.',
    );
  }
  if (cancelledAt?.isBefore(startedAt)) {
    throw new AdoptedTrainingProgramValidationError(
      'Program cancellation timestamp cannot precede the start timestamp.',
    );
  }
}
