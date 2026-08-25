import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

const STATUSES = ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;
const parseInteger = ({ value }: { value: unknown }): unknown => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string' || value.trim() === '') return value;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : value;
};

export class ListWorkoutHistoryQueryDto {
  @ApiPropertyOptional({ enum: STATUSES })
  @IsOptional()
  @IsIn(STATUSES)
  status?: (typeof STATUSES)[number];

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from?: Date;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to?: Date;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Transform(parseInteger)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @ApiPropertyOptional({ default: 0, minimum: 0 })
  @IsOptional()
  @Transform(parseInteger)
  @IsInt()
  @Min(0)
  offset = 0;
}
