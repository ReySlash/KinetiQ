import { Transform, type TransformFnParams } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

function trimString({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

function parseInteger({ value }: TransformFnParams): unknown {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string' || value.trim() === '') return value;

  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : value;
}

export const ROUTINE_SORTS = [
  'updatedAt:asc',
  'updatedAt:desc',
  'name:asc',
  'name:desc',
] as const;

export type RoutineSort = (typeof ROUTINE_SORTS)[number];

export class FindRoutinesQueryDto {
  @ApiPropertyOptional({ maxLength: 100, example: 'upper' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  q?: string;

  @ApiPropertyOptional({ enum: ROUTINE_SORTS, example: 'updatedAt:desc' })
  @IsOptional()
  @IsIn(ROUTINE_SORTS)
  sort?: RoutineSort;

  @ApiPropertyOptional({ minimum: 0, maximum: 100, default: 20 })
  @IsOptional()
  @Transform(parseInteger)
  @IsInt()
  @Min(0)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ minimum: 0, default: 0 })
  @IsOptional()
  @Transform(parseInteger)
  @IsInt()
  @Min(0)
  offset?: number;
}
