import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

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

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
