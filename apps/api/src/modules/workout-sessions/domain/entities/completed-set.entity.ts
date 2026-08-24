import { Entity } from '../../../shared/domain/entity';
import { ExistingUuid } from '../../../shared/domain/value-objects/existing-uuid.vo';
import { UniqueId } from '../../../shared/domain/value-objects/unique-id.vo';
import { WorkoutSessionValidationError } from '../errors/workout-session.errors';
import {
  CanonicalLoad,
  CompletedSetRepetitions,
  LoadUnit,
  RepetitionsInReserve,
  type LoadUnitValue,
} from '../value-objects/completed-set-performance.vo';
import { WorkoutOrder } from '../value-objects/workout-order.vo';
import {
  immutableDate,
  validateAuditTimestamps,
  validDate,
} from '../utils/workout-session.validation';
import type {
  PrimitiveCompletedSet,
  RecordCompletedSetAttributes,
  UpdateCompletedSetAttributes,
} from './workout-session.types';

// Helper function to handle optional RIR values
function optionalRir(value: number | null | undefined): number | null {
  return value === undefined || value === null
    ? null
    : RepetitionsInReserve.create(value).value;
}

// CompletedSet entity representing a completed set in a workout session
export class CompletedSet extends Entity<UniqueId> {
  private constructor(state: PrimitiveCompletedSet) {
    super(UniqueId.create(state.id));
    this.exercisePerformanceId = state.exercisePerformanceId;
    this.order = state.order;
    this.repetitions = state.repetitions;
    this.loadKg = state.loadKg;
    this.loadUnit = state.loadUnit;
    this.rir = state.rir;
    this.isWarmup = state.isWarmup;
    this.completedAtValue = immutableDate(state.completedAt);
    this.createdAtValue = immutableDate(state.createdAt);
    this.updatedAtValue = immutableDate(state.updatedAt);
    Object.freeze(this);
  }

  public readonly exercisePerformanceId: string;
  public readonly order: number;
  public readonly repetitions: number;
  public readonly loadKg: string;
  public readonly loadUnit: LoadUnitValue;
  public readonly rir: number | null;
  public readonly isWarmup: boolean;
  private readonly completedAtValue: Date;
  private readonly createdAtValue: Date;
  private readonly updatedAtValue: Date;

  get completedAt(): Date {
    return this.completedAtValue;
  }

  get createdAt(): Date {
    return this.createdAtValue;
  }

  get updatedAt(): Date {
    return this.updatedAtValue;
  }

  // Create a new completed set
  static create(
    exercisePerformanceId: string,
    order: number,
    attributes: RecordCompletedSetAttributes,
  ): CompletedSet {
    const now = new Date();
    const loadUnit = LoadUnit.create(attributes.loadUnit);
    return new CompletedSet({
      id: UniqueId.create().value,
      exercisePerformanceId: ExistingUuid.create(exercisePerformanceId).value,
      order: WorkoutOrder.create(order).value,
      repetitions: CompletedSetRepetitions.create(attributes.repetitions).value,
      loadKg: CanonicalLoad.create(attributes.load, loadUnit.value).value,
      loadUnit: loadUnit.value,
      rir: optionalRir(attributes.rir),
      isWarmup: attributes.isWarmup ?? false,
      completedAt: validDate(
        attributes.completedAt ?? now,
        'Completed set completion timestamp',
      ),
      createdAt: now,
      updatedAt: now,
    });
  }

  // Reconstitute a completed set from persisted data
  static reconstitute(attributes: PrimitiveCompletedSet): CompletedSet {
    ExistingUuid.create(attributes.exercisePerformanceId);
    WorkoutOrder.create(attributes.order);
    CompletedSetRepetitions.create(attributes.repetitions);
    LoadUnit.create(attributes.loadUnit);
    optionalRir(attributes.rir);
    validDate(attributes.completedAt, 'Completed set completion timestamp');
    validateAuditTimestamps(
      attributes.createdAt,
      attributes.updatedAt,
      'Completed set',
    );
    return new CompletedSet({
      ...attributes,
      loadKg: CanonicalLoad.create(attributes.loadKg, 'KG').value,
    });
  }

  // Update a completed set with new attributes
  update(attributes: UpdateCompletedSetAttributes): CompletedSet {
    const hasLoad = attributes.load !== undefined;
    const hasLoadUnit = attributes.loadUnit !== undefined;
    if (hasLoad !== hasLoadUnit) {
      throw new WorkoutSessionValidationError(
        'Completed set load and loadUnit must be updated together.',
      );
    }

    let loadUnit = this.loadUnit;
    let loadKg = this.loadKg;
    if (attributes.load !== undefined && attributes.loadUnit !== undefined) {
      loadUnit = LoadUnit.create(attributes.loadUnit).value;
      loadKg = CanonicalLoad.create(attributes.load, loadUnit).value;
    }
    return new CompletedSet({
      id: this.id.value,
      exercisePerformanceId: this.exercisePerformanceId,
      order: this.order,
      repetitions:
        attributes.repetitions === undefined
          ? this.repetitions
          : CompletedSetRepetitions.create(attributes.repetitions).value,
      loadKg,
      loadUnit,
      rir:
        attributes.rir === undefined ? this.rir : optionalRir(attributes.rir),
      isWarmup: attributes.isWarmup ?? this.isWarmup,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  // Create a new completed set with a different order
  withOrder(order: number): CompletedSet {
    return new CompletedSet({
      id: this.id.value,
      exercisePerformanceId: this.exercisePerformanceId,
      order: WorkoutOrder.create(order).value,
      repetitions: this.repetitions,
      loadKg: this.loadKg,
      loadUnit: this.loadUnit,
      rir: this.rir,
      isWarmup: this.isWarmup,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  // Convert the completed set to a primitive value
  toValue(): PrimitiveCompletedSet {
    return {
      id: this.id.value,
      exercisePerformanceId: this.exercisePerformanceId,
      order: this.order,
      repetitions: this.repetitions,
      loadKg: this.loadKg,
      loadUnit: this.loadUnit,
      rir: this.rir,
      isWarmup: this.isWarmup,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
