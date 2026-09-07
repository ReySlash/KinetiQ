import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AnalyticsOverviewQueryDto {
  @ApiProperty({
    description: 'IANA timezone used for local weeks and training days.',
    example: 'Asia/Qatar',
  })
  @IsString()
  @IsNotEmpty()
  timezone!: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @Transform(({ value }) => toDateWithExplicitOffset(value))
  @IsDate()
  from?: Date;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @Transform(({ value }) => toDateWithExplicitOffset(value))
  @IsDate()
  to?: Date;
}

const RFC3339_DATE_TIME =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function toDateWithExplicitOffset(value: unknown): Date | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || !RFC3339_DATE_TIME.test(value)) {
    return new Date(Number.NaN);
  }
  return new Date(value);
}
