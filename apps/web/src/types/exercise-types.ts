export type ExerciseForceType = "PUSH" | "PULL" | "STATIC" | "OTHER";
export type ExerciseKineticChain = "OPEN" | "CLOSED" | "MIXED";
export type ExerciseLaterality =
  | "UNILATERAL"
  | "BILATERAL"
  | "ALTERNATING"
  | "OTHER";
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
export type ExerciseSkillLevel =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "EXPERT"
  | "OTHER";

export type ExerciseMuscleSummary = {
  name: string;
  slug: string;
  thumbnailUrl: string | null;
  imageAltText: string | null;
};

type MovementPattern = {
  name: string;
  slug: string;
  description: string;
};

type Capabilities = {
  hypertrophyPotential: number;
  maximalStrengthPotential: number;
  powerDevelopmentPotential: number;
  muscularEndurancePotential: number;
  stabilityDevelopmentPotential: number;
  typicalLoadability: number;
  stretchPositionLoading: number;
  shortenedPositionLoading: number;
  editorialNotes: string | null;
};

type Demands = {
  technicalDemand: number;
  setupComplexity: number;
  stabilityDemand: number;
  systemicFatiguePotential: number;
  localFatiguePotential: number;
  recoveryCostPotential: number;
  gripDemand: number;
  axialLoadingPotential: number;
  editorialNotes: string | null;
};
type Equipment = {
  name: string;
  slug: string;
  description: string | null;
};

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
  movementPattern: MovementPattern | null;
  capabilities: Capabilities | null;
  demands: Demands | null;
  muscles: ExerciseMuscleSummary[];
  equipment: Equipment[];
};

export type Exercise = {
  id: string;
  name: string;
  slug: string;
  skillLevel: ExerciseSkillLevel;
  thumbnailUrl: string | null;
  thumbnailStorageKey: string | null;
  imageAltText: string | null;
  muscles: {
    name: string;
    slug: string;
  }[];
};
