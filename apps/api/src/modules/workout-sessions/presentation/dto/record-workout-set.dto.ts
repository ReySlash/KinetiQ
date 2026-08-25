import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
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

export class RecordWorkoutSetDto {
  @ApiProperty({ minimum: 0, maximum: 1000 })
  @IsInt()
  @Min(0)
  @Max(1000)
  repetitions!: number;

  @ApiProperty({ example: '100.25' })
  @Transform(trim)
  @IsString()
  load!: string;

  @ApiProperty({ enum: LOAD_UNITS })
  @IsIn(LOAD_UNITS)
  loadUnit!: (typeof LOAD_UNITS)[number];

  @ApiPropertyOptional({ nullable: true, minimum: 0, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  rir?: number | null;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isWarmup?: boolean;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  completedAt?: Date;
}
