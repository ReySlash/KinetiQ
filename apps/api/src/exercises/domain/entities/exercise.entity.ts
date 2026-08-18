import { Entity } from '../../../modules/shared/domain/entity';
import { ExistingUuid } from '../../../modules/shared/domain/value-objects/existing-uuid.vo';
import { UniqueId } from '../../../modules/shared/domain/value-objects/unique-id.vo';
import {
  ExerciseBodyPosition,
  ExerciseContractionMode,
  ExerciseForceType,
  ExerciseKineticChain,
  ExerciseLaterality,
  ExerciseMuscleRole,
  ExerciseSkillLevel,
} from '../value-objects/exercise-enums.vo';
import {
  ExerciseCommonMistakes,
  ExerciseDescription,
  ExerciseEditorialNotes,
  ExerciseInstructions,
  ExerciseName,
  ExerciseNotes,
} from '../value-objects/exercise-text.vo';
import {
  ExerciseImageAltText,
  ExerciseThumbnailStorageKey,
  ExerciseThumbnailUrl,
} from '../value-objects/exercise-media.vo';
import { ExerciseScore } from '../value-objects/exercise-score.vo';
import { ExerciseSlug } from '../value-objects/exercise-slug.vo';
import { ExerciseValidationError } from '../errors/exercise.errors';
import type {
  CreateExerciseAttributes,
  ExerciseCapabilityProfileAttributes,
  ExerciseDemandProfileAttributes,
  ExerciseMuscleAssignmentAttributes,
  PrimitiveExercise,
  PrimitiveExerciseCapabilityProfile,
  PrimitiveExerciseDemandProfile,
  PrimitiveExerciseMuscleAssignment,
  UpdateExerciseAttributes,
} from './exercise.types';

function optionalText(
  value: string | null | undefined,
  create: (value: string) => { value: string },
): string | null {
  return value === undefined || value === null ? null : create(value).value;
}

function validateIds(
  ids: string[],
  label: string,
  requireOne: boolean,
): string[] {
  if (requireOne && ids.length === 0) {
    throw new ExerciseValidationError(
      `Exercise must have at least one ${label}.`,
    );
  }
  const values = ids.map((id) => ExistingUuid.create(id).value);
  if (new Set(values).size !== values.length) {
    throw new ExerciseValidationError(
      `Each ${label} may be assigned only once.`,
    );
  }
  return values;
}

function toMuscleAssignment(
  assignment: ExerciseMuscleAssignmentAttributes,
): PrimitiveExerciseMuscleAssignment {
  const notes = optionalText(assignment.notes, (value) =>
    ExerciseNotes.create(value),
  );
  return {
    muscleId: ExistingUuid.create(assignment.muscleId).value,
    role: ExerciseMuscleRole.create(assignment.role).value,
    involvementScore: ExerciseScore.create(assignment.involvementScore).value,
    notes,
  };
}

function validateMuscles(
  muscles: ExerciseMuscleAssignmentAttributes[],
): PrimitiveExerciseMuscleAssignment[] {
  if (muscles.length === 0) {
    throw new ExerciseValidationError(
      'Exercise must have at least one muscle assignment.',
    );
  }
  const assignments = muscles.map(toMuscleAssignment);
  if (
    new Set(assignments.map((muscle) => muscle.muscleId)).size !==
    assignments.length
  ) {
    throw new ExerciseValidationError('Each muscle may be assigned only once.');
  }
  if (!assignments.some((muscle) => muscle.role === 'PRIMARY')) {
    throw new ExerciseValidationError(
      'An exercise must have at least one primary muscle.',
    );
  }
  return assignments;
}

function toCapabilityProfile(
  profile: ExerciseCapabilityProfileAttributes,
): PrimitiveExerciseCapabilityProfile {
  return {
    hypertrophyPotential: ExerciseScore.create(profile.hypertrophyPotential)
      .value,
    maximalStrengthPotential: ExerciseScore.create(
      profile.maximalStrengthPotential,
    ).value,
    powerDevelopmentPotential: ExerciseScore.create(
      profile.powerDevelopmentPotential,
    ).value,
    muscularEndurancePotential: ExerciseScore.create(
      profile.muscularEndurancePotential,
    ).value,
    stabilityDevelopmentPotential: ExerciseScore.create(
      profile.stabilityDevelopmentPotential,
    ).value,
    typicalLoadability: ExerciseScore.create(profile.typicalLoadability).value,
    stretchPositionLoading: ExerciseScore.create(profile.stretchPositionLoading)
      .value,
    shortenedPositionLoading: ExerciseScore.create(
      profile.shortenedPositionLoading,
    ).value,
    editorialNotes: optionalText(profile.editorialNotes, (value) =>
      ExerciseEditorialNotes.create(value),
    ),
  };
}

function toDemandProfile(
  profile: ExerciseDemandProfileAttributes,
): PrimitiveExerciseDemandProfile {
  return {
    technicalDemand: ExerciseScore.create(profile.technicalDemand).value,
    setupComplexity: ExerciseScore.create(profile.setupComplexity).value,
    stabilityDemand: ExerciseScore.create(profile.stabilityDemand).value,
    systemicFatiguePotential: ExerciseScore.create(
      profile.systemicFatiguePotential,
    ).value,
    localFatiguePotential: ExerciseScore.create(profile.localFatiguePotential)
      .value,
    recoveryCostPotential: ExerciseScore.create(profile.recoveryCostPotential)
      .value,
    gripDemand: ExerciseScore.create(profile.gripDemand).value,
    axialLoadingPotential: ExerciseScore.create(profile.axialLoadingPotential)
      .value,
    editorialNotes: optionalText(profile.editorialNotes, (value) =>
      ExerciseEditorialNotes.create(value),
    ),
  };
}

export class Exercise extends Entity<UniqueId> {
  public readonly name: string;
  public readonly slug: string;
  public readonly description: string;
  public readonly instructions: string;
  public readonly commonMistakes: string | null;
  public readonly movementPatternId: string;
  public readonly forceType: PrimitiveExercise['forceType'];
  public readonly kineticChain: PrimitiveExercise['kineticChain'];
  public readonly isCompound: boolean;
  public readonly laterality: PrimitiveExercise['laterality'];
  public readonly contractionMode: PrimitiveExercise['contractionMode'];
  public readonly bodyPosition: PrimitiveExercise['bodyPosition'];
  public readonly skillLevel: PrimitiveExercise['skillLevel'];
  public readonly thumbnailUrl: string | null;
  public readonly thumbnailStorageKey: string | null;
  public readonly imageAltText: string | null;
  public readonly isActive: boolean;
  public readonly archivedAt: Date | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly equipmentIds: string[];
  public readonly muscles: PrimitiveExerciseMuscleAssignment[];
  public readonly capabilities: PrimitiveExerciseCapabilityProfile | null;
  public readonly demands: PrimitiveExerciseDemandProfile | null;

  private constructor(attributes: PrimitiveExercise) {
    super(UniqueId.create(attributes.id));
    this.name = attributes.name;
    this.slug = attributes.slug;
    this.description = attributes.description;
    this.instructions = attributes.instructions;
    this.commonMistakes = attributes.commonMistakes;
    this.movementPatternId = attributes.movementPatternId;
    this.forceType = attributes.forceType;
    this.kineticChain = attributes.kineticChain;
    this.isCompound = attributes.isCompound;
    this.laterality = attributes.laterality;
    this.contractionMode = attributes.contractionMode;
    this.bodyPosition = attributes.bodyPosition;
    this.skillLevel = attributes.skillLevel;
    this.thumbnailUrl = attributes.thumbnailUrl;
    this.thumbnailStorageKey = attributes.thumbnailStorageKey;
    this.imageAltText = attributes.imageAltText;
    this.isActive = attributes.isActive;
    this.archivedAt = attributes.archivedAt;
    this.createdAt = attributes.createdAt;
    this.updatedAt = attributes.updatedAt;
    this.equipmentIds = [...attributes.equipmentIds];
    this.muscles = attributes.muscles.map((muscle) => ({ ...muscle }));
    this.capabilities = attributes.capabilities
      ? { ...attributes.capabilities }
      : null;
    this.demands = attributes.demands ? { ...attributes.demands } : null;
  }

  static create(attributes: CreateExerciseAttributes): Exercise {
    const name = ExerciseName.create(attributes.name);
    const slug = ExerciseSlug.create(attributes.slug ?? attributes.name);
    const equipmentIds = validateIds(
      attributes.equipmentIds,
      'equipment',
      true,
    );
    const muscles = validateMuscles(attributes.muscles);
    const now = new Date();

    return new Exercise({
      id: UniqueId.create().value,
      name: name.value,
      slug: slug.value,
      description: ExerciseDescription.create(attributes.description).value,
      instructions: ExerciseInstructions.create(attributes.instructions).value,
      commonMistakes: optionalText(attributes.commonMistakes, (value) =>
        ExerciseCommonMistakes.create(value),
      ),
      movementPatternId: ExistingUuid.create(attributes.movementPatternId)
        .value,
      forceType: ExerciseForceType.create(attributes.forceType).value,
      kineticChain: ExerciseKineticChain.create(attributes.kineticChain).value,
      isCompound: attributes.isCompound,
      laterality: ExerciseLaterality.create(attributes.laterality).value,
      contractionMode: ExerciseContractionMode.create(
        attributes.contractionMode,
      ).value,
      bodyPosition: ExerciseBodyPosition.create(attributes.bodyPosition).value,
      skillLevel: ExerciseSkillLevel.create(attributes.skillLevel).value,
      thumbnailUrl: optionalText(attributes.thumbnailUrl, (value) =>
        ExerciseThumbnailUrl.create(value),
      ),
      thumbnailStorageKey: optionalText(
        attributes.thumbnailStorageKey,
        (value) => ExerciseThumbnailStorageKey.create(value),
      ),
      imageAltText: optionalText(attributes.imageAltText, (value) =>
        ExerciseImageAltText.create(value),
      ),
      isActive: true,
      archivedAt: null,
      createdAt: now,
      updatedAt: now,
      equipmentIds,
      muscles,
      capabilities: toCapabilityProfile(attributes.capabilities),
      demands: toDemandProfile(attributes.demands),
    });
  }

  static reconstitute(attributes: PrimitiveExercise): Exercise {
    return new Exercise(attributes);
  }

  update(attributes: UpdateExerciseAttributes): Exercise {
    const equipmentIds =
      attributes.equipmentIds === undefined
        ? this.equipmentIds
        : validateIds(attributes.equipmentIds, 'equipment', true);
    const muscles =
      attributes.muscles === undefined
        ? this.muscles
        : validateMuscles(attributes.muscles);

    return new Exercise({
      id: this.id.value,
      name:
        attributes.name === undefined
          ? this.name
          : ExerciseName.create(attributes.name).value,
      slug: this.slug,
      description:
        attributes.description === undefined
          ? this.description
          : ExerciseDescription.create(attributes.description).value,
      instructions:
        attributes.instructions === undefined
          ? this.instructions
          : ExerciseInstructions.create(attributes.instructions).value,
      commonMistakes:
        attributes.commonMistakes === undefined
          ? this.commonMistakes
          : optionalText(attributes.commonMistakes, (value) =>
              ExerciseCommonMistakes.create(value),
            ),
      movementPatternId:
        attributes.movementPatternId === undefined
          ? this.movementPatternId
          : ExistingUuid.create(attributes.movementPatternId).value,
      forceType:
        attributes.forceType === undefined
          ? this.forceType
          : ExerciseForceType.create(attributes.forceType).value,
      kineticChain:
        attributes.kineticChain === undefined
          ? this.kineticChain
          : ExerciseKineticChain.create(attributes.kineticChain).value,
      isCompound: attributes.isCompound ?? this.isCompound,
      laterality:
        attributes.laterality === undefined
          ? this.laterality
          : ExerciseLaterality.create(attributes.laterality).value,
      contractionMode:
        attributes.contractionMode === undefined
          ? this.contractionMode
          : ExerciseContractionMode.create(attributes.contractionMode).value,
      bodyPosition:
        attributes.bodyPosition === undefined
          ? this.bodyPosition
          : ExerciseBodyPosition.create(attributes.bodyPosition).value,
      skillLevel:
        attributes.skillLevel === undefined
          ? this.skillLevel
          : ExerciseSkillLevel.create(attributes.skillLevel).value,
      thumbnailUrl:
        attributes.thumbnailUrl === undefined
          ? this.thumbnailUrl
          : optionalText(attributes.thumbnailUrl, (value) =>
              ExerciseThumbnailUrl.create(value),
            ),
      thumbnailStorageKey:
        attributes.thumbnailStorageKey === undefined
          ? this.thumbnailStorageKey
          : optionalText(attributes.thumbnailStorageKey, (value) =>
              ExerciseThumbnailStorageKey.create(value),
            ),
      imageAltText:
        attributes.imageAltText === undefined
          ? this.imageAltText
          : optionalText(attributes.imageAltText, (value) =>
              ExerciseImageAltText.create(value),
            ),
      isActive: this.isActive,
      archivedAt: this.archivedAt,
      createdAt: this.createdAt,
      updatedAt: new Date(),
      equipmentIds,
      muscles,
      capabilities:
        attributes.capabilities === undefined
          ? this.capabilities
          : toCapabilityProfile(attributes.capabilities),
      demands:
        attributes.demands === undefined
          ? this.demands
          : toDemandProfile(attributes.demands),
    });
  }

  archive(): Exercise {
    return new Exercise({
      ...this.toValue(),
      isActive: false,
      archivedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  toValue(): PrimitiveExercise {
    return {
      id: this.id.value,
      name: this.name,
      slug: this.slug,
      description: this.description,
      instructions: this.instructions,
      commonMistakes: this.commonMistakes,
      movementPatternId: this.movementPatternId,
      forceType: this.forceType,
      kineticChain: this.kineticChain,
      isCompound: this.isCompound,
      laterality: this.laterality,
      contractionMode: this.contractionMode,
      bodyPosition: this.bodyPosition,
      skillLevel: this.skillLevel,
      thumbnailUrl: this.thumbnailUrl,
      thumbnailStorageKey: this.thumbnailStorageKey,
      imageAltText: this.imageAltText,
      isActive: this.isActive,
      archivedAt: this.archivedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      equipmentIds: [...this.equipmentIds],
      muscles: this.muscles.map((muscle) => ({ ...muscle })),
      capabilities: this.capabilities ? { ...this.capabilities } : null,
      demands: this.demands ? { ...this.demands } : null,
    };
  }
}
