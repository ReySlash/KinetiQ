import { ValueObject } from '../../../modules/shared/domain/value-objects/value-object.vo';
import { ExerciseValidationError } from '../errors/exercise.errors';
import type {
  BodyPosition,
  ContractionMode,
  ForceType,
  KineticChain,
  Laterality,
  MuscleRole,
  SkillLevel,
} from '../entities/exercise.types';

function enumValue<T extends string>(
  value: T,
  values: readonly T[],
  label: string,
): T {
  if (!values.includes(value)) {
    throw new ExerciseValidationError(`Exercise ${label} is invalid.`);
  }
  return value;
}

export class ExerciseForceType extends ValueObject<ForceType> {
  private constructor(value: ForceType) {
    super(value);
  }
  static create(value: ForceType): ExerciseForceType {
    return new ExerciseForceType(
      enumValue(value, ['PUSH', 'PULL', 'STATIC', 'OTHER'], 'forceType'),
    );
  }
}
export class ExerciseKineticChain extends ValueObject<KineticChain> {
  private constructor(value: KineticChain) {
    super(value);
  }
  static create(value: KineticChain): ExerciseKineticChain {
    return new ExerciseKineticChain(
      enumValue(value, ['OPEN', 'CLOSED', 'MIXED'], 'kineticChain'),
    );
  }
}
export class ExerciseLaterality extends ValueObject<Laterality> {
  private constructor(value: Laterality) {
    super(value);
  }
  static create(value: Laterality): ExerciseLaterality {
    return new ExerciseLaterality(
      enumValue(
        value,
        ['UNILATERAL', 'BILATERAL', 'ALTERNATING', 'OTHER'],
        'laterality',
      ),
    );
  }
}
export class ExerciseContractionMode extends ValueObject<ContractionMode> {
  private constructor(value: ContractionMode) {
    super(value);
  }
  static create(value: ContractionMode): ExerciseContractionMode {
    return new ExerciseContractionMode(
      enumValue(value, ['DYNAMIC', 'ISOMETRIC', 'MIXED'], 'contractionMode'),
    );
  }
}
export class ExerciseBodyPosition extends ValueObject<BodyPosition> {
  private constructor(value: BodyPosition) {
    super(value);
  }
  static create(value: BodyPosition): ExerciseBodyPosition {
    return new ExerciseBodyPosition(
      enumValue(
        value,
        [
          'STANDING',
          'SITTING',
          'SUPINE',
          'PRONE',
          'KNEELING',
          'HINGED',
          'INVERTED',
          'OTHER',
        ],
        'bodyPosition',
      ),
    );
  }
}
export class ExerciseSkillLevel extends ValueObject<SkillLevel> {
  private constructor(value: SkillLevel) {
    super(value);
  }
  static create(value: SkillLevel): ExerciseSkillLevel {
    return new ExerciseSkillLevel(
      enumValue(
        value,
        ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', 'OTHER'],
        'skillLevel',
      ),
    );
  }
}
export class ExerciseMuscleRole extends ValueObject<MuscleRole> {
  private constructor(value: MuscleRole) {
    super(value);
  }
  static create(value: MuscleRole): ExerciseMuscleRole {
    return new ExerciseMuscleRole(
      enumValue(value, ['PRIMARY', 'SECONDARY', 'STABILIZER'], 'muscle role'),
    );
  }
}
