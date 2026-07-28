import { Transform, type TransformFnParams } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

function trimStringValue({ value }: TransformFnParams): unknown {
  if (typeof value === 'string') {
    return value.trim();
  }

  return value;
}

export class FindExercisesQueryDto {
  @Transform(trimStringValue)
  @IsOptional()
  @IsString()
  @MinLength(3)
  search?: string;

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
