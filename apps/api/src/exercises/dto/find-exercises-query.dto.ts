import { Transform, type TransformFnParams } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import {
  ForceType,
  Laterality,
  SkillLevel,
} from '../../../generated/prisma/client';

function trimStringValue({ value }: TransformFnParams): unknown {
  if (typeof value === 'string') {
    return value.trim();
  }

  return value;
}

function normalizeOptionalEnumValue({ value }: TransformFnParams): unknown {
  if (typeof value === 'string') {
    const normalizedValue = value.trim().toUpperCase();

    return normalizedValue.length > 0 ? normalizedValue : undefined;
  }

  return value;
}

export class FindExercisesQueryDto {
  @Transform(trimStringValue)
  @IsOptional()
  @IsString()
  @MinLength(3)
  search?: string;

  @Transform(normalizeOptionalEnumValue)
  @IsOptional()
  @IsEnum(ForceType)
  forceType?: ForceType;

  @Transform(normalizeOptionalEnumValue)
  @IsOptional()
  @IsEnum(Laterality)
  laterality?: Laterality;

  @Transform(normalizeOptionalEnumValue)
  @IsOptional()
  @IsEnum(SkillLevel)
  skillLevel?: SkillLevel;

  @IsOptional()
  @IsNumber()
  @IsInt()
  @Min(0)
  @Max(20)
  limit?: number;
  @IsOptional()
  @IsNumber()
  @IsInt()
  @Min(0)
  offset?: number;
}
