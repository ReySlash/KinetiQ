import type {
  BodyPosition,
  ContractionMode,
  ForceType,
  KineticChain,
  Laterality,
  SkillLevel,
} from '../../domain/entities/exercise.types';

export type ExerciseDetail = {
  name: string;
  slug: string;
  description: string;
  instructions: string;
  commonMistakes: string | null;
  forceType: ForceType;
  kineticChain: KineticChain;
  isCompound: boolean;
  laterality: Laterality;
  contractionMode: ContractionMode;
  bodyPosition: BodyPosition;
  skillLevel: SkillLevel;
  thumbnailUrl: string | null;
  thumbnailStorageKey: string | null;
  imageAltText: string | null;
  movementPattern: {
    name: string;
    slug: string;
    description: string | null;
  } | null;
  capabilities: {
    hypertrophyPotential: number;
    maximalStrengthPotential: number;
    powerDevelopmentPotential: number;
    muscularEndurancePotential: number;
    stabilityDevelopmentPotential: number;
    typicalLoadability: number;
    stretchPositionLoading: number;
    shortenedPositionLoading: number;
    editorialNotes: string | null;
  } | null;
  demands: {
    technicalDemand: number;
    setupComplexity: number;
    stabilityDemand: number;
    systemicFatiguePotential: number;
    localFatiguePotential: number;
    recoveryCostPotential: number;
    gripDemand: number;
    axialLoadingPotential: number;
    editorialNotes: string | null;
  } | null;
  muscles: Array<{
    name: string;
    slug: string;
    thumbnailUrl: string | null;
    imageAltText: string | null;
  }>;
  equipment: Array<{
    name: string;
    slug: string;
    description: string | null;
  }>;
};
