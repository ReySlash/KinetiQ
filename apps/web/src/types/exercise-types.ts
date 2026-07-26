export type ExerciseForceType = "PUSH" | "PULL" | "STATIC" | "OTHER";
export type ExerciseKineticChain = "OPEN" | "CLOSED" | "MIXED";
export type ExerciseLaterality = "UNILATERAL" | "BILATERAL" | "ALTERNATING" | "OTHER";
export type ExerciseContractionMode = "DYNAMIC" | "ISOMETRIC" | "MIXED";
export type ExerciseBodyPosition =
  | "STANDING"
  | "SITTING"
  | "SUPINE"
  | "PRONE"
  | "KNEELING"
  | "HINGED"
  | "INVERTED"
  | "OTHER";
export type ExerciseSkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT" | "OTHER";

export type ExerciseDetails = {
  name: string;
  slug: string;
  description: string;
  instructions: string;
  commonMistakes: string | null;
  forceType: ExerciseForceType;
  kineticChain: ExerciseKineticChain;
  isCompound: boolean;
  laterality: ExerciseLaterality;
  contractionMode: ExerciseContractionMode;
  bodyPosition: ExerciseBodyPosition;
  skillLevel: ExerciseSkillLevel;
  thumbnailUrl: string | null;
  thumbnailStorageKey: string | null;
  imageAltText: string | null;
  movementPattern: {
    name: string;
    slug: string;
    description: string;
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
  equipment: {
    name: string;
    slug: string;
    description: string | null;
  }[];
};

export type Exercise = {
  name: string;
  slug: string;
  thumbnailUrl: string | null;
  thumbnailStorageKey: string | null;
  imageAltText: string | null;
};
