import { Entity } from '../../../shared/domain/entity';
import { ExistingUuid } from '../../../shared/domain/value-objects/existing-uuid.vo';
import { UniqueId } from '../../../shared/domain/value-objects/unique-id.vo';
import {
  WorkoutSessionChildNotFoundError,
  WorkoutSessionStateError,
  WorkoutSessionValidationError,
} from '../errors/workout-session.errors';
import { RoutineNameSnapshot } from '../value-objects/historical-name.vo';
import { IanaTimezone } from '../value-objects/iana-timezone.vo';
import { WorkoutSessionStatus } from '../value-objects/workout-session-status.vo';
import {
  optionalUuid,
  validateAuditTimestamps,
  validDate,
} from '../utils/workout-session.validation';
import { ExercisePerformance } from './exercise-performance.entity';
import type {
  AddExerciseAttributes,
  PrimitiveWorkoutSession,
  RecordCompletedSetAttributes,
  StartWorkoutSessionAttributes,
  UpdateCompletedSetAttributes,
} from './workout-session.types';

// Validates that exercise performances are in canonical order (contiguous from zero)
function validateCanonicalPerformanceOrder(
  performances: readonly ExercisePerformance[],
): void {
  performances.forEach((performance, index) => {
    if (performance.order !== index) {
      throw new WorkoutSessionValidationError(
        'Exercise performance order must be unique and contiguous from zero.',
      );
    }
  });
}

type WorkoutSessionLifecycle = Pick<
  PrimitiveWorkoutSession,
  'status' | 'startedAt' | 'completedAt' | 'cancelledAt'
>;

// Validates workout session lifecycle constraints
function validateLifecycle(attributes: WorkoutSessionLifecycle): void {
  const startedAt = validDate(attributes.startedAt, 'Workout start timestamp');
  const completedAt = attributes.completedAt
    ? validDate(attributes.completedAt, 'Workout completion timestamp')
    : null;
  const cancelledAt = attributes.cancelledAt
    ? validDate(attributes.cancelledAt, 'Workout cancellation timestamp')
    : null;

  // Validate status-specific constraints
  if (
    attributes.status === 'IN_PROGRESS' &&
    (completedAt !== null || cancelledAt !== null)
  ) {
    throw new WorkoutSessionValidationError(
      'An in-progress workout cannot have a completion or cancellation timestamp.',
    );
  }
  if (
    attributes.status === 'COMPLETED' &&
    (completedAt === null || cancelledAt !== null)
  ) {
    throw new WorkoutSessionValidationError(
      'A completed workout requires only a completion timestamp.',
    );
  }
  if (
    attributes.status === 'CANCELLED' &&
    (cancelledAt === null || completedAt !== null)
  ) {
    throw new WorkoutSessionValidationError(
      'A cancelled workout requires only a cancellation timestamp.',
    );
  }
  if (completedAt && completedAt < startedAt) {
    throw new WorkoutSessionValidationError(
      'Workout completion timestamp cannot precede the start timestamp.',
    );
  }
  if (cancelledAt && cancelledAt < startedAt) {
    throw new WorkoutSessionValidationError(
      'Workout cancellation timestamp cannot precede the start timestamp.',
    );
  }
}

// Validates that child entities belong to this workout session
function validateChildren(
  sessionId: string,
  startedAt: Date,
  performances: readonly ExercisePerformance[],
): void {
  // Validate workout session ID consistency
  performances.forEach((performance) => {
    if (performance.workoutSessionId !== sessionId) {
      throw new WorkoutSessionValidationError(
        'Exercise performance belongs to a different workout session.',
      );
    }
    // Validate exercise performance ID consistency
    performance.completedSets.forEach((set) => {
      if (set.exercisePerformanceId !== performance.id.value) {
        throw new WorkoutSessionValidationError(
          'Completed set belongs to a different exercise performance.',
        );
      }
      if (set.completedAt < startedAt) {
        throw new WorkoutSessionValidationError(
          'Completed set timestamp cannot precede the workout start timestamp.',
        );
      }
    });
  });
}

// Finds the latest completed set timestamp across all performances
// Returns null if no sets have been completed
function latestCompletedSetAt(
  performances: readonly ExercisePerformance[],
): Date | null {
  return performances.reduce<Date | null>((latest, performance) => {
    return performance.completedSets.reduce<Date | null>((setLatest, set) => {
      if (!setLatest || set.completedAt > setLatest) return set.completedAt;
      return setLatest;
    }, latest);
  }, null);
}

/*
 * Manages a workout instance with lifecycle states and nested exercise performances.
 * Created via start, reconstituted via reconstitute.
 * Enforces lifecycle rules: IN_PROGRESS, COMPLETED, CANCELLED.
 * Holds related ExercisePerformance objects and timestamps.
 */
export class WorkoutSession extends Entity<UniqueId> {
  private constructor(state: WorkoutSessionState) {
    super(state.id);
    // Core identity
    this.ownerId = state.ownerId;
    this.sourceRoutineId = state.sourceRoutineId;
    this.sourceRoutineNameSnapshot = state.sourceRoutineNameSnapshot;
    // Lifecycle
    this.status = state.status;
    this.timezone = state.timezone;
    this.startedAt = state.startedAt;
    this.completedAt = state.completedAt;
    this.cancelledAt = state.cancelledAt;
    this.createdAt = state.createdAt;
    this.updatedAt = state.updatedAt;
    this.exercisePerformances = state.exercisePerformances;
  }

  public readonly ownerId: string;
  public readonly sourceRoutineId: string | null;
  public readonly sourceRoutineNameSnapshot: string | null;
  public readonly status: PrimitiveWorkoutSession['status'];
  public readonly timezone: string;
  public readonly startedAt: Date;
  public readonly completedAt: Date | null;
  public readonly cancelledAt: Date | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly exercisePerformances: readonly ExercisePerformance[];

  // Returns total number of completed sets across all exercise performances in a workout session.
  get completedSetCount(): number {
    return this.exercisePerformances.reduce(
      (count, performance) => count + performance.completedSets.length,
      0,
    );
  }

  // Creates a new workout session in IN_PROGRESS state.
  static start(attributes: StartWorkoutSessionAttributes): WorkoutSession {
    const id = UniqueId.create();
    const now = new Date();
    const startedAt = validDate(
      attributes.startedAt ?? now,
      'Workout start timestamp',
    );

    const sourceRoutine = attributes.sourceRoutine ?? null;
    const sourceRoutineId = sourceRoutine
      ? ExistingUuid.create(sourceRoutine.id).value
      : null;
    const sourceRoutineNameSnapshot = sourceRoutine
      ? RoutineNameSnapshot.create(sourceRoutine.name).value
      : null;
    // Build exercise performances from routine exercises
    const exercisePerformances = (sourceRoutine?.exercises ?? []).map(
      (exercise, order) => {
        if (!exercise.sourceRoutineExerciseId) {
          throw new WorkoutSessionValidationError(
            'Routine-based exercise performances require routine exercise provenance.',
          );
        }
        if (!exercise.prescription) {
          throw new WorkoutSessionValidationError(
            'Routine-based exercise performances require a prescription snapshot.',
          );
        }
        return ExercisePerformance.create(id.value, order, exercise);
      },
    );

    return new WorkoutSession({
      id,
      ownerId: ExistingUuid.create(attributes.ownerId).value,
      sourceRoutineId,
      sourceRoutineNameSnapshot,
      status: 'IN_PROGRESS',
      timezone: IanaTimezone.create(attributes.timezone).value,
      startedAt,
      completedAt: null,
      cancelledAt: null,
      createdAt: now,
      updatedAt: now,
      exercisePerformances,
    });
  }

  static reconstitute(attributes: PrimitiveWorkoutSession): WorkoutSession {
    const id = ExistingUuid.create(attributes.id);
    const ownerId = ExistingUuid.create(attributes.ownerId).value;
    const sourceRoutineId = optionalUuid(attributes.sourceRoutineId);
    if (attributes.sourceRoutineId && !attributes.sourceRoutineNameSnapshot) {
      throw new WorkoutSessionValidationError(
        'Routine provenance requires a routine name snapshot.',
      );
    }
    const sourceRoutineNameSnapshot =
      attributes.sourceRoutineNameSnapshot === null
        ? null
        : RoutineNameSnapshot.create(attributes.sourceRoutineNameSnapshot)
            .value;
    const status = WorkoutSessionStatus.create(attributes.status).value;
    const timezone = IanaTimezone.create(attributes.timezone).value;
    const startedAt = validDate(
      attributes.startedAt,
      'Workout start timestamp',
    );
    const completedAt = attributes.completedAt
      ? validDate(attributes.completedAt, 'Workout completion timestamp')
      : null;
    const cancelledAt = attributes.cancelledAt
      ? validDate(attributes.cancelledAt, 'Workout cancellation timestamp')
      : null;
    const exercisePerformances = attributes.exercisePerformances.map(
      (performance) => ExercisePerformance.reconstitute(performance),
    );
    validateCanonicalPerformanceOrder(exercisePerformances);
    validateChildren(id.value, startedAt, exercisePerformances);
    validateLifecycle({
      status,
      startedAt,
      completedAt,
      cancelledAt,
    });
    validateAuditTimestamps(
      attributes.createdAt,
      attributes.updatedAt,
      'Workout session',
    );
    // Validate that completed workouts have at least one set
    const completedSetCount = exercisePerformances.reduce(
      (count, performance) => count + performance.completedSets.length,
      0,
    );
    // If the session is completed, it must have at least one set
    if (status === 'COMPLETED' && completedSetCount === 0) {
      throw new WorkoutSessionValidationError(
        'A completed workout must contain at least one recorded set.',
      );
    }
    return new WorkoutSession({
      id,
      ownerId,
      sourceRoutineId,
      sourceRoutineNameSnapshot,
      status,
      timezone,
      startedAt,
      completedAt,
      cancelledAt,
      createdAt: attributes.createdAt,
      updatedAt: attributes.updatedAt,
      exercisePerformances,
    });
  }

  addExercise(attributes: AddExerciseAttributes): WorkoutSession {
    this.assertInProgress();
    if (!attributes.isExerciseActive) {
      throw new WorkoutSessionValidationError(
        'Only active exercises can be added to a workout.',
      );
    }
    const exercisePerformance = ExercisePerformance.create(
      this.id.value,
      this.exercisePerformances.length,
      {
        exerciseId: attributes.exerciseId,
        exerciseName: attributes.exerciseName,
        sourceRoutineExerciseId: null,
        prescription: null,
      },
    );
    return this.withPerformances([
      ...this.exercisePerformances,
      exercisePerformance,
    ]);
  }

  removeExercise(exercisePerformanceId: string): WorkoutSession {
    this.assertInProgress();
    const performance = this.findPerformance(exercisePerformanceId);
    if (performance.completedSets.length > 0) {
      throw new WorkoutSessionStateError(
        'An exercise with recorded sets cannot be removed.',
      );
    }
    return this.withPerformances(
      this.exercisePerformances
        .filter((item) => item.id.value !== exercisePerformanceId)
        .map((item, order) => item.withOrder(order)),
    );
  }

  recordSet(
    exercisePerformanceId: string,
    attributes: RecordCompletedSetAttributes,
  ): WorkoutSession {
    this.assertInProgress();
    const completedAt = attributes.completedAt ?? new Date();
    validDate(completedAt, 'Completed set completion timestamp');
    if (completedAt < this.startedAt) {
      throw new WorkoutSessionValidationError(
        'Completed set timestamp cannot precede the workout start timestamp.',
      );
    }
    return this.replacePerformance(
      exercisePerformanceId,
      this.findPerformance(exercisePerformanceId).recordSet({
        ...attributes,
        completedAt,
      }),
    );
  }

  updateSet(
    exercisePerformanceId: string,
    completedSetId: string,
    attributes: UpdateCompletedSetAttributes,
  ): WorkoutSession {
    this.assertInProgress();
    return this.replacePerformance(
      exercisePerformanceId,
      this.findPerformance(exercisePerformanceId).updateSet(
        completedSetId,
        attributes,
      ),
    );
  }

  deleteSet(
    exercisePerformanceId: string,
    completedSetId: string,
  ): WorkoutSession {
    this.assertInProgress();
    return this.replacePerformance(
      exercisePerformanceId,
      this.findPerformance(exercisePerformanceId).deleteSet(completedSetId),
    );
  }

  // Completes the workout session and validates that at least one set was recorded.
  complete(completedAt = new Date()): WorkoutSession {
    this.assertInProgress();
    validDate(completedAt, 'Workout completion timestamp');
    // Validate that at least one set was recorded
    if (this.completedSetCount === 0) {
      throw new WorkoutSessionStateError(
        'A workout requires at least one recorded set before completion.',
      );
    }
    // Validate that the completion timestamp is not before the start timestamp
    if (completedAt < this.startedAt) {
      throw new WorkoutSessionValidationError(
        'Workout completion timestamp cannot precede the start timestamp.',
      );
    }
    const latestSetAt = latestCompletedSetAt(this.exercisePerformances);
    // Validate that the completion timestamp is not before the latest completed set
    if (latestSetAt && completedAt < latestSetAt) {
      throw new WorkoutSessionValidationError(
        'Workout completion timestamp cannot precede the latest completed set.',
      );
    }
    return this.withLifecycle('COMPLETED', completedAt, null);
  }

  // Cancels the workout session and validates timestamp constraints.
  cancel(cancelledAt = new Date()): WorkoutSession {
    this.assertInProgress();
    validDate(cancelledAt, 'Workout cancellation timestamp');
    // Validate that the cancellation timestamp is not before the start timestamp
    if (cancelledAt < this.startedAt) {
      throw new WorkoutSessionValidationError(
        'Workout cancellation timestamp cannot precede the start timestamp.',
      );
    }
    const latestSetAt = latestCompletedSetAt(this.exercisePerformances);
    // Validate that the cancellation timestamp is not before the latest completed set
    if (latestSetAt && cancelledAt < latestSetAt) {
      throw new WorkoutSessionValidationError(
        'Workout cancellation timestamp cannot precede the latest completed set.',
      );
    }
    return this.withLifecycle('CANCELLED', null, cancelledAt);
  }

  // Asserts that the workout session is in progress.
  private assertInProgress(): void {
    if (this.status !== 'IN_PROGRESS') {
      throw new WorkoutSessionStateError(
        'Only an in-progress workout can be modified.',
      );
    }
  }

  // Finds an exercise performance by its ID.
  private findPerformance(id: string): ExercisePerformance {
    ExistingUuid.create(id);
    const performance = this.exercisePerformances.find(
      (item) => item.id.value === id,
    );
    if (!performance) {
      throw new WorkoutSessionChildNotFoundError(
        'Exercise performance was not found.',
      );
    }
    return performance;
  }

  // Replaces an exercise performance in the workout session.
  private replacePerformance(
    id: string,
    replacement: ExercisePerformance,
  ): WorkoutSession {
    return this.withPerformances(
      this.exercisePerformances.map((performance) =>
        performance.id.value === id ? replacement : performance,
      ),
    );
  }

  // Creates a new workout session with the provided exercise performances.
  private withPerformances(
    performances: readonly ExercisePerformance[],
  ): WorkoutSession {
    return new WorkoutSession({
      id: this.id,
      ownerId: this.ownerId,
      sourceRoutineId: this.sourceRoutineId,
      sourceRoutineNameSnapshot: this.sourceRoutineNameSnapshot,
      status: this.status,
      timezone: this.timezone,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      cancelledAt: this.cancelledAt,
      createdAt: this.createdAt,
      updatedAt: new Date(),
      exercisePerformances: performances,
    });
  }

  // Creates a new workout session with the provided lifecycle state.
  private withLifecycle(
    status: 'COMPLETED' | 'CANCELLED',
    completedAt: Date | null,
    cancelledAt: Date | null,
  ): WorkoutSession {
    return new WorkoutSession({
      id: this.id,
      ownerId: this.ownerId,
      sourceRoutineId: this.sourceRoutineId,
      sourceRoutineNameSnapshot: this.sourceRoutineNameSnapshot,
      status,
      timezone: this.timezone,
      startedAt: this.startedAt,
      completedAt,
      cancelledAt,
      createdAt: this.createdAt,
      updatedAt: new Date(),
      exercisePerformances: this.exercisePerformances,
    });
  }

  toValue(): PrimitiveWorkoutSession {
    return {
      id: this.id.value,
      ownerId: this.ownerId,
      sourceRoutineId: this.sourceRoutineId,
      sourceRoutineNameSnapshot: this.sourceRoutineNameSnapshot,
      status: this.status,
      timezone: this.timezone,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      cancelledAt: this.cancelledAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      exercisePerformances: this.exercisePerformances.map((performance) =>
        performance.toValue(),
      ),
    };
  }
}

// Represents the internal state of a workout session.
type WorkoutSessionState = {
  id: UniqueId;
  ownerId: string;
  sourceRoutineId: string | null;
  sourceRoutineNameSnapshot: string | null;
  status: PrimitiveWorkoutSession['status'];
  timezone: string;
  startedAt: Date;
  completedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  exercisePerformances: readonly ExercisePerformance[];
};
