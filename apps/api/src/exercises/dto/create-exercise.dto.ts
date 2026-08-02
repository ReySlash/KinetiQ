import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  BodyPosition,
  ContractionMode,
  ForceType,
  KineticChain,
  Laterality,
  MuscleRole,
  SkillLevel,
} from '../../../generated/prisma/client';

export class ExerciseMuscleAssignmentDto {
  @IsUUID()
  muscleId!: string;

  @IsEnum(MuscleRole)
  role!: MuscleRole;

  @IsInt()
  @Min(0)
  @Max(5)
  involvementScore!: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class ExerciseCapabilityProfileDto {
  @IsInt()
  @Min(0)
  @Max(5)
  hypertrophyPotential!: number;

  @IsInt()
  @Min(0)
  @Max(5)
  maximalStrengthPotential!: number;

  @IsInt()
  @Min(0)
  @Max(5)
  powerDevelopmentPotential!: number;

  @IsInt()
  @Min(0)
  @Max(5)
  muscularEndurancePotential!: number;

  @IsInt()
  @Min(0)
  @Max(5)
  stabilityDevelopmentPotential!: number;

  @IsInt()
  @Min(0)
  @Max(5)
  typicalLoadability!: number;

  @IsInt()
  @Min(0)
  @Max(5)
  stretchPositionLoading!: number;

  @IsInt()
  @Min(0)
  @Max(5)
  shortenedPositionLoading!: number;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  editorialNotes?: string;
}

export class ExerciseDemandProfileDto {
  @IsInt()
  @Min(0)
  @Max(5)
  technicalDemand!: number;

  @IsInt()
  @Min(0)
  @Max(5)
  setupComplexity!: number;

  @IsInt()
  @Min(0)
  @Max(5)
  stabilityDemand!: number;

  @IsInt()
  @Min(0)
  @Max(5)
  systemicFatiguePotential!: number;

  @IsInt()
  @Min(0)
  @Max(5)
  localFatiguePotential!: number;

  @IsInt()
  @Min(0)
  @Max(5)
  recoveryCostPotential!: number;

  @IsInt()
  @Min(0)
  @Max(5)
  gripDemand!: number;

  @IsInt()
  @Min(0)
  @Max(5)
  axialLoadingPotential!: number;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  editorialNotes?: string;
}

export class CreateExerciseDto {
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  slug?: string;

  @IsString()
  @MinLength(20)
  @MaxLength(3000)
  description!: string;

  @IsString()
  @MinLength(20)
  @MaxLength(10000)
  instructions!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  commonMistakes?: string;

  @IsUUID()
  movementPatternId!: string;

  @IsEnum(ForceType)
  forceType!: ForceType;

  @IsEnum(KineticChain)
  kineticChain!: KineticChain;

  @IsBoolean()
  isCompound!: boolean;

  @IsEnum(Laterality)
  laterality!: Laterality;

  @IsEnum(ContractionMode)
  contractionMode!: ContractionMode;

  @IsEnum(BodyPosition)
  bodyPosition!: BodyPosition;

  @IsEnum(SkillLevel)
  skillLevel!: SkillLevel;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  thumbnailStorageKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  imageAltText?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  equipmentIds!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ExerciseMuscleAssignmentDto)
  muscles!: ExerciseMuscleAssignmentDto[];

  @ValidateNested()
  @Type(() => ExerciseCapabilityProfileDto)
  capabilities!: ExerciseCapabilityProfileDto;

  @ValidateNested()
  @Type(() => ExerciseDemandProfileDto)
  demands!: ExerciseDemandProfileDto;
}
