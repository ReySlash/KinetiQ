import type {
  BodyPosition,
  ContractionMode,
  ForceType,
  KineticChain,
  Laterality,
  MuscleRole,
  SkillLevel,
} from '../../../generated/prisma/client';

import type {
  ExerciseCapabilitySeed,
  ExerciseDemandSeed,
  ExerciseSeed,
  Score,
} from '../types';

type Classification = readonly [
  movementPatternSlug: string,
  forceType: ForceType,
  kineticChain: KineticChain,
  isCompound: boolean,
  laterality: Laterality,
  contractionMode: ContractionMode,
  bodyPosition: BodyPosition,
  skillLevel: SkillLevel,
];

type MuscleRelation = readonly [
  muscleSlug: string,
  role: MuscleRole,
  involvementScore: Score,
  notes?: string,
];

type ProfileScores = readonly [
  score1: Score,
  score2: Score,
  score3: Score,
  score4: Score,
  score5: Score,
  score6: Score,
  score7: Score,
  score8: Score,
];

type ExerciseDefinition = {
  name: string;
  slug: string;
  description: string;
  instructions: string;
  commonMistakes: string;
  imageAltText: string;
  classification: Classification;
  equipmentSlugs: string[];
  muscles: MuscleRelation[];
  capabilityScores: ProfileScores;
  demandScores: ProfileScores;
  capabilityNotes?: string;
  demandNotes?: string;
};

function toCapabilities(
  scores: ProfileScores,
  editorialNotes?: string,
): ExerciseCapabilitySeed {
  return {
    hypertrophyPotential: scores[0],
    maximalStrengthPotential: scores[1],
    powerDevelopmentPotential: scores[2],
    muscularEndurancePotential: scores[3],
    stabilityDevelopmentPotential: scores[4],
    typicalLoadability: scores[5],
    stretchPositionLoading: scores[6],
    shortenedPositionLoading: scores[7],
    editorialNotes,
  };
}

function toDemands(
  scores: ProfileScores,
  editorialNotes?: string,
): ExerciseDemandSeed {
  return {
    technicalDemand: scores[0],
    setupComplexity: scores[1],
    stabilityDemand: scores[2],
    systemicFatiguePotential: scores[3],
    localFatiguePotential: scores[4],
    recoveryCostPotential: scores[5],
    gripDemand: scores[6],
    axialLoadingPotential: scores[7],
    editorialNotes,
  };
}

export function createExercise(definition: ExerciseDefinition): ExerciseSeed {
  const [
    movementPatternSlug,
    forceType,
    kineticChain,
    isCompound,
    laterality,
    contractionMode,
    bodyPosition,
    skillLevel,
  ] = definition.classification;

  return {
    name: definition.name,
    slug: definition.slug,
    description: definition.description,
    instructions: definition.instructions,
    commonMistakes: definition.commonMistakes,
    movementPatternSlug,
    forceType,
    kineticChain,
    isCompound,
    laterality,
    contractionMode,
    bodyPosition,
    skillLevel,
    imageAltText: definition.imageAltText,
    equipmentSlugs: definition.equipmentSlugs,
    muscles: definition.muscles.map(
      ([muscleSlug, role, involvementScore, notes]) => ({
        muscleSlug,
        role,
        involvementScore,
        notes,
      }),
    ),
    capabilities: toCapabilities(
      definition.capabilityScores,
      definition.capabilityNotes,
    ),
    demands: toDemands(definition.demandScores, definition.demandNotes),
  };
}
