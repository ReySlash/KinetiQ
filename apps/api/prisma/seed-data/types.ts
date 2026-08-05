import type {
  BodyPosition,
  BodyRegion,
  ContractionMode,
  ForceType,
  KineticChain,
  Laterality,
  MuscleFunctionRole,
  MuscleRole,
  SkillLevel,
} from '../../generated/prisma/client';

export type Score = 0 | 1 | 2 | 3 | 4 | 5;

export type MuscleGroupSeed = {
  name: string;
  slug: string;
  description: string;
  bodyRegion: BodyRegion;
  sortOrder: number;
  imageAltText: string;
};

export type MuscleSeed = {
  name: string;
  slug: string;
  description: string;
  bodyRegion: BodyRegion;
  muscleGroupSlug: string;
  parentSlug?: string;
  imageAltText: string;
  sortOrder: number;
  isActive?: boolean;
};

export type MuscleFunctionSeed = {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  isActive?: boolean;
};

export type MuscleFunctionAssignmentSeed = {
  muscleSlug: string;
  muscleFunctionSlug: string;
  role: MuscleFunctionRole;
  contributionScore?: Score;
  notes?: string;
};

export type EquipmentSeed = {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
};

export type MovementPatternSeed = {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
};

export type ExerciseMuscleSeed = {
  muscleSlug: string;
  role: MuscleRole;
  involvementScore: Score;
  notes?: string;
};

export type ExerciseCapabilitySeed = {
  hypertrophyPotential: Score;
  maximalStrengthPotential: Score;
  powerDevelopmentPotential: Score;
  muscularEndurancePotential: Score;
  stabilityDevelopmentPotential: Score;
  typicalLoadability: Score;
  stretchPositionLoading: Score;
  shortenedPositionLoading: Score;
  editorialNotes?: string;
};

export type ExerciseDemandSeed = {
  technicalDemand: Score;
  setupComplexity: Score;
  stabilityDemand: Score;
  systemicFatiguePotential: Score;
  localFatiguePotential: Score;
  recoveryCostPotential: Score;
  gripDemand: Score;
  axialLoadingPotential: Score;
  editorialNotes?: string;
};

export type ExerciseSeed = {
  name: string;
  slug: string;
  description: string;
  instructions: string;
  commonMistakes?: string;
  movementPatternSlug: string;
  forceType: ForceType;
  kineticChain: KineticChain;
  isCompound: boolean;
  laterality: Laterality;
  contractionMode: ContractionMode;
  bodyPosition: BodyPosition;
  skillLevel: SkillLevel;
  imageAltText: string;
  equipmentSlugs: string[];
  muscles: ExerciseMuscleSeed[];
  capabilities: ExerciseCapabilitySeed;
  demands: ExerciseDemandSeed;
};

export type ExerciseCategory = {
  name: string;
  slug: string;
  exercises: ExerciseSeed[];
};

export type RoutineExerciseSeed = {
  exerciseSlug: string;
  order: number;
  sets: number;
  minReps: number;
  maxReps: number;
  targetRir?: number;
  restSeconds?: number;
  tempo?: string;
  notes?: string;
};

export type RoutineSeed = {
  key: string;
  name: string;
  description: string;
  exercises: readonly RoutineExerciseSeed[];
};
