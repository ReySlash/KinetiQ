import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

const RFC3339_DATE_TIME =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

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
  @IsString()
  @Matches(RFC3339_DATE_TIME)
  from?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsString()
  @Matches(RFC3339_DATE_TIME)
  to?: string;
}
