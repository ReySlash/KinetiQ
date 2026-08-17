export type ForceType = 'PUSH' | 'PULL' | 'STATIC' | 'OTHER';
export type KineticChain = 'OPEN' | 'CLOSED' | 'MIXED';
export type Laterality = 'UNILATERAL' | 'BILATERAL' | 'ALTERNATING' | 'OTHER';
export type ContractionMode = 'DYNAMIC' | 'ISOMETRIC' | 'MIXED';
export type BodyPosition =
  | 'STANDING'
  | 'SITTING'
  | 'SUPINE'
  | 'PRONE'
  | 'KNEELING'
  | 'HINGED'
  | 'INVERTED'
  | 'OTHER';
export type SkillLevel =
  'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | 'OTHER';
export type MuscleRole = 'PRIMARY' | 'SECONDARY' | 'STABILIZER';

export type ExerciseMuscleAssignmentAttributes = {
  muscleId: string;
  role: MuscleRole;
  involvementScore: number;
  notes?: string | null;
};

export type ExerciseCapabilityProfileAttributes = {
  hypertrophyPotential: number;
  maximalStrengthPotential: number;
  powerDevelopmentPotential: number;
  muscularEndurancePotential: number;
  stabilityDevelopmentPotential: number;
  typicalLoadability: number;
  stretchPositionLoading: number;
  shortenedPositionLoading: number;
  editorialNotes?: string | null;
};

export type ExerciseDemandProfileAttributes = {
  technicalDemand: number;
  setupComplexity: number;
  stabilityDemand: number;
  systemicFatiguePotential: number;
  localFatiguePotential: number;
  recoveryCostPotential: number;
  gripDemand: number;
  axialLoadingPotential: number;
  editorialNotes?: string | null;
};

export type CreateExerciseAttributes = {
  name: string;
  slug?: string;
  description: string;
  instructions: string;
  commonMistakes?: string | null;
  movementPatternId?: string | null;
  forceType: ForceType;
  kineticChain: KineticChain;
  isCompound: boolean;
  laterality: Laterality;
  contractionMode: ContractionMode;
  bodyPosition: BodyPosition;
  skillLevel: SkillLevel;
  thumbnailUrl?: string | null;
  thumbnailStorageKey?: string | null;
  imageAltText?: string | null;
  equipmentIds: string[];
  muscles: ExerciseMuscleAssignmentAttributes[];
  capabilities: ExerciseCapabilityProfileAttributes;
  demands: ExerciseDemandProfileAttributes;
};

export type UpdateExerciseAttributes = Partial<
  Omit<CreateExerciseAttributes, 'slug' | 'equipmentIds' | 'muscles'>
> & {
  equipmentIds?: string[];
  muscles?: ExerciseMuscleAssignmentAttributes[];
};

export type PrimitiveExerciseMuscleAssignment = {
  muscleId: string;
  role: MuscleRole;
  involvementScore: number;
  notes: string | null;
};

export type PrimitiveExerciseCapabilityProfile =
  ExerciseCapabilityProfileAttributes & {
    editorialNotes: string | null;
  };

export type PrimitiveExerciseDemandProfile = ExerciseDemandProfileAttributes & {
  editorialNotes: string | null;
};

export type PrimitiveExercise = {
  id: string;
  name: string;
  slug: string;
  description: string;
  instructions: string;
  commonMistakes: string | null;
  movementPatternId: string | null;
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
  isActive: boolean;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  equipmentIds: string[];
  muscles: PrimitiveExerciseMuscleAssignment[];
  capabilities: PrimitiveExerciseCapabilityProfile | null;
  demands: PrimitiveExerciseDemandProfile | null;
};
