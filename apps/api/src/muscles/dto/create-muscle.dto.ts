import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import type { BodyRegion as BodyRegionValue } from '../../../generated/prisma/enums';

const bodyRegionValues = [
  'UPPER_BODY',
  'LOWER_BODY',
  'CORE',
  'FULL_BODY',
  'OTHER',
] as const satisfies readonly BodyRegionValue[];

export class CreateMuscleDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(120)
  slug?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description!: string;

  @IsEnum(bodyRegionValues)
  bodyRegion!: BodyRegionValue;

  @IsString()
  @IsOptional()
  @MaxLength(2048)
  thumbnailUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(512)
  thumbnailStorageKey?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  imageAltText?: string;

  @IsOptional()
  @IsUUID()
  muscleGroupId?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
