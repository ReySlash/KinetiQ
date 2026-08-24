import { Entity } from '../../../shared/domain/entity';
import { ExistingUuid } from '../../../shared/domain/value-objects/existing-uuid.vo';
import { UniqueId } from '../../../shared/domain/value-objects/unique-id.vo';
import {
  WorkoutSessionChildNotFoundError,
  WorkoutSessionValidationError,
} from '../errors/workout-session.errors';
import { ExerciseNameSnapshot } from '../value-objects/historical-name.vo';
import { PrescriptionSnapshot } from '../value-objects/prescription-snapshot.vo';
import { WorkoutOrder } from '../value-objects/workout-order.vo';
import {
  optionalUuid,
  validateAuditTimestamps,
} from '../utils/workout-session.validation';
import { CompletedSet } from './completed-set.entity';
import type {
  CreateExercisePerformanceAttributes,
  PrimitiveExercisePerformance,
  RecordCompletedSetAttributes,
  UpdateCompletedSetAttributes,
} from './workout-session.types';

// Convert primitive exercise performance attributes to a prescription snapshot
function snapshotFromPrimitive(
  attributes: PrimitiveExercisePerformance,
): PrescriptionSnapshot | null {
  const targetSetCount = attributes.targetSetCount;
  const targetMinReps = attributes.targetMinReps;
  const targetMaxReps = attributes.targetMaxReps;
  const coreValues = [targetSetCount, targetMinReps, targetMaxReps];
  const hasAnyCoreValue = coreValues.some((value) => value !== null);
  const hasEveryCoreValue = coreValues.every((value) => value !== null);

  // Validate that core prescription values are provided together
  if (hasAnyCoreValue && !hasEveryCoreValue) {
    throw new WorkoutSessionValidationError(
      'Prescription set count and repetition range must be stored together.',
    );
  }

  // Validate that supplementary prescription values are not provided without core values
  if (!hasAnyCoreValue) {
    const hasSupplementaryValue = [
      attributes.targetRir,
      attributes.targetRestSeconds,
      attributes.targetTempo,
      attributes.prescriptionNotes,
    ].some((value) => value !== null);
    if (hasSupplementaryValue) {
      throw new WorkoutSessionValidationError(
        'Supplementary prescription values require a set and repetition target.',
      );
    }
    return null;
  }

  // Validate that core prescription values are not null
  if (
    targetSetCount === null ||
    targetMinReps === null ||
    targetMaxReps === null
  ) {
    throw new WorkoutSessionValidationError(
      'Prescription set count and repetition range must be stored together.',
    );
  }

  return PrescriptionSnapshot.create({
    targetSetCount,
    targetMinReps,
    targetMaxReps,
    targetRir: attributes.targetRir,
    targetRestSeconds: attributes.targetRestSeconds,
    targetTempo: attributes.targetTempo,
    prescriptionNotes: attributes.prescriptionNotes,
  });
}

// Extract prescription fields from a snapshot
function snapshotFields(
  snapshot: PrescriptionSnapshot | null,
): Pick<
  PrimitiveExercisePerformance,
  | 'targetSetCount'
  | 'targetMinReps'
  | 'targetMaxReps'
  | 'targetRir'
  | 'targetRestSeconds'
  | 'targetTempo'
  | 'prescriptionNotes'
> {
  // Return null values if no snapshot exists
  if (!snapshot) {
    return {
      targetSetCount: null,
      targetMinReps: null,
      targetMaxReps: null,
      targetRir: null,
      targetRestSeconds: null,
      targetTempo: null,
      prescriptionNotes: null,
    };
  }
  return { ...snapshot.value };
}

// Validate that completed sets are in canonical order (contiguous from zero)
function validateCanonicalSetOrder(sets: readonly CompletedSet[]): void {
  sets.forEach((set, index) => {
    if (set.order !== index) {
      throw new WorkoutSessionValidationError(
        'Completed set order must be unique and contiguous from zero.',
      );
    }
  });
}

// Represents an individual exercise within a workout session, including its sets and optional prescription snapshot
export class ExercisePerformance extends Entity<UniqueId> {
  private constructor(state: ExercisePerformanceState) {
    super(state.id);
    this.workoutSessionId = state.workoutSessionId;
    this.exerciseId = state.exerciseId;
    this.sourceRoutineExerciseId = state.sourceRoutineExerciseId;
    this.order = state.order;
    this.exerciseNameSnapshot = state.exerciseNameSnapshot;
    this.prescription = state.prescription;

    // Validate that routine-based exercises have a prescription
    if (this.sourceRoutineExerciseId !== null && this.prescription === null) {
      throw new WorkoutSessionValidationError(
        'Routine-based exercise performances require a prescription snapshot.',
      );
    }
    this.createdAt = state.createdAt;
    this.updatedAt = state.updatedAt;
    this.completedSets = state.completedSets;
    // Validate that all completed sets belong to this exercise performance
    this.completedSets.forEach((set) => {
      if (set.exercisePerformanceId !== this.id.value) {
        throw new WorkoutSessionValidationError(
          'Completed set belongs to a different exercise performance.',
        );
      }
    });
    // Ensures completed sets are in contiguous zero-based order for an exercise performance.
    validateCanonicalSetOrder(this.completedSets);
  }

  public readonly workoutSessionId: string;
  public readonly exerciseId: string;
  public readonly sourceRoutineExerciseId: string | null;
  public readonly order: number;
  public readonly exerciseNameSnapshot: string;
  public readonly prescription: PrescriptionSnapshot | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly completedSets: readonly CompletedSet[];

  static create(
    workoutSessionId: string,
    order: number,
    attributes: CreateExercisePerformanceAttributes,
  ): ExercisePerformance {
    const now = new Date();
    const snapshot = attributes.prescription
      ? PrescriptionSnapshot.create(attributes.prescription)
      : null;
    return new ExercisePerformance({
      id: UniqueId.create(),
      workoutSessionId: ExistingUuid.create(workoutSessionId).value,
      exerciseId: ExistingUuid.create(attributes.exerciseId).value,
      sourceRoutineExerciseId: optionalUuid(attributes.sourceRoutineExerciseId),
      order: WorkoutOrder.create(order).value,
      exerciseNameSnapshot: ExerciseNameSnapshot.create(attributes.exerciseName)
        .value,
      createdAt: now,
      updatedAt: now,
      completedSets: [],
      prescription: snapshot,
    });
  }

  static reconstitute(
    attributes: PrimitiveExercisePerformance,
  ): ExercisePerformance {
    const workoutSessionId = ExistingUuid.create(
      attributes.workoutSessionId,
    ).value;
    const exerciseId = ExistingUuid.create(attributes.exerciseId).value;
    const sourceRoutineExerciseId = optionalUuid(
      attributes.sourceRoutineExerciseId,
    );
    const order = WorkoutOrder.create(attributes.order).value;
    const exerciseNameSnapshot = ExerciseNameSnapshot.create(
      attributes.exerciseNameSnapshot,
    ).value;
    const completedSets = attributes.completedSets.map((set) =>
      CompletedSet.reconstitute(set),
    );
    validateAuditTimestamps(
      attributes.createdAt,
      attributes.updatedAt,
      'Exercise performance',
    );
    return new ExercisePerformance({
      id: UniqueId.create(attributes.id),
      workoutSessionId,
      exerciseId,
      sourceRoutineExerciseId,
      order,
      exerciseNameSnapshot,
      prescription: snapshotFromPrimitive(attributes),
      createdAt: attributes.createdAt,
      updatedAt: attributes.updatedAt,
      completedSets,
    });
  }

  /**
   * Records a completed set for this exercise performance.
   * @param attributes The attributes for the completed set.
   * @returns A new ExercisePerformance instance with the recorded set.
   */
  recordSet(attributes: RecordCompletedSetAttributes): ExercisePerformance {
    const set = CompletedSet.create(
      this.id.value,
      this.completedSets.length,
      attributes,
    );
    return this.withSets([...this.completedSets, set]);
  }

  /**
   * Updates an existing completed set for this exercise performance.
   * @param setId The ID of the set to update.
   * @param attributes The attributes to update.
   * @returns A new ExercisePerformance instance with the updated set.
   */
  updateSet(
    setId: string,
    attributes: UpdateCompletedSetAttributes,
  ): ExercisePerformance {
    ExistingUuid.create(setId);
    let found = false;
    const completedSets = this.completedSets.map((set) => {
      if (set.id.value !== setId) return set;
      found = true;
      return set.update(attributes);
    });
    if (!found) {
      throw new WorkoutSessionChildNotFoundError(
        'Completed set was not found.',
      );
    }
    return this.withSets(completedSets);
  }

  /**
   * Deletes a completed set for this exercise performance.
   * @param setId The ID of the set to delete.
   * @returns A new ExercisePerformance instance with the deleted set.
   */
  deleteSet(setId: string): ExercisePerformance {
    ExistingUuid.create(setId);
    const completedSets = this.completedSets.filter(
      (set) => set.id.value !== setId,
    );
    if (completedSets.length === this.completedSets.length) {
      throw new WorkoutSessionChildNotFoundError(
        'Completed set was not found.',
      );
    }
    return this.withSets(
      completedSets.map((set, order) => set.withOrder(order)),
    );
  }

  /**
   * Updates the order of this exercise performance.
   * @param order The new order.
   * @returns A new ExercisePerformance instance with the updated order.
   */
  withOrder(order: number): ExercisePerformance {
    return new ExercisePerformance({
      id: this.id,
      workoutSessionId: this.workoutSessionId,
      exerciseId: this.exerciseId,
      sourceRoutineExerciseId: this.sourceRoutineExerciseId,
      order: WorkoutOrder.create(order).value,
      exerciseNameSnapshot: this.exerciseNameSnapshot,
      prescription: this.prescription,
      createdAt: this.createdAt,
      updatedAt: new Date(),
      completedSets: this.completedSets,
    });
  }

  /**
   * Updates the completed sets for this exercise performance.
   * @param sets The new completed sets.
   * @returns A new ExercisePerformance instance with the updated completed sets.
   */
  private withSets(sets: readonly CompletedSet[]): ExercisePerformance {
    return new ExercisePerformance({
      id: this.id,
      workoutSessionId: this.workoutSessionId,
      exerciseId: this.exerciseId,
      sourceRoutineExerciseId: this.sourceRoutineExerciseId,
      order: this.order,
      exerciseNameSnapshot: this.exerciseNameSnapshot,
      prescription: this.prescription,
      createdAt: this.createdAt,
      updatedAt: new Date(),
      completedSets: sets,
    });
  }

  toValue(): PrimitiveExercisePerformance {
    return {
      id: this.id.value,
      workoutSessionId: this.workoutSessionId,
      exerciseId: this.exerciseId,
      sourceRoutineExerciseId: this.sourceRoutineExerciseId,
      order: this.order,
      exerciseNameSnapshot: this.exerciseNameSnapshot,
      ...snapshotFields(this.prescription),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      completedSets: this.completedSets.map((set) => set.toValue()),
    };
  }
}

// Internal state type for the entity - represents the internal structure
type ExercisePerformanceState = {
  id: UniqueId;
  workoutSessionId: string;
  exerciseId: string;
  sourceRoutineExerciseId: string | null;
  order: number;
  exerciseNameSnapshot: string;
  prescription: PrescriptionSnapshot | null;
  createdAt: Date;
  updatedAt: Date;
  completedSets: readonly CompletedSet[];
};
