import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import type { BodyRegion } from '../../../../generated/prisma/enums';

const bodyRegionValues = [
  'UPPER_BODY',
  'LOWER_BODY',
  'CORE',
  'FULL_BODY',
  'OTHER',
] as const satisfies readonly BodyRegion[];

function trimStringValue({ value }: TransformFnParams): unknown {
  if (typeof value === 'string') {
    return value.trim();
  }

  return value;
}

export class CreateMuscleGroupDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @Transform(trimStringValue)
  name!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @Transform(trimStringValue)
  slug?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @Transform(trimStringValue)
  description!: string;

  @IsEnum(bodyRegionValues)
  bodyRegion!: BodyRegion;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  thumbnailStorageKey?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  imageAltText?: string;
}
