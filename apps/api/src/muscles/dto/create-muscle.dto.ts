import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform, type TransformFnParams } from 'class-transformer';
import type { BodyRegion as BodyRegionValue } from '../../../generated/prisma/enums';

const bodyRegionValues = [
  'UPPER_BODY',
  'LOWER_BODY',
  'CORE',
  'FULL_BODY',
  'OTHER',
] as const satisfies readonly BodyRegionValue[];

function trimStringValue({ value }: TransformFnParams): unknown {
  if (typeof value === 'string') {
    return value.trim();
  }

  return value;
}

export class CreateMuscleDto {
  @Transform(trimStringValue)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @Transform(trimStringValue)
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(120)
  slug?: string;

  @Transform(trimStringValue)
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description!: string;

  @IsEnum(bodyRegionValues)
  bodyRegion!: BodyRegionValue;

  @Transform(trimStringValue)
  @IsString()
  @IsOptional()
  @MaxLength(2048)
  thumbnailUrl?: string;

  @Transform(trimStringValue)
  @IsString()
  @IsOptional()
  @MaxLength(512)
  thumbnailStorageKey?: string;

  @Transform(trimStringValue)
  @IsString()
  @IsOptional()
  @MaxLength(200)
  imageAltText?: string;

  @Transform(trimStringValue)
  @IsOptional()
  @IsUUID()
  muscleGroupId?: string;

  @Transform(trimStringValue)
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
