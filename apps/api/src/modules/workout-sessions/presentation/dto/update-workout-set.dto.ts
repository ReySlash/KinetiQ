import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

const LOAD_UNITS = ['KG', 'LB'] as const;
const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class UpdateWorkoutSetDto {
  @ApiPropertyOptional({ minimum: 0, maximum: 1000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  repetitions?: number;

  @ApiPropertyOptional({ example: '100.25' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  load?: string;

  @ApiPropertyOptional({ enum: LOAD_UNITS })
  @IsOptional()
  @IsIn(LOAD_UNITS)
  loadUnit?: (typeof LOAD_UNITS)[number];

  @ApiPropertyOptional({ nullable: true, minimum: 0, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  rir?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isWarmup?: boolean;
}
