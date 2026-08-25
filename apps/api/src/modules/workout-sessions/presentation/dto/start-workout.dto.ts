import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsOptional,
  IsString,
  IsTimeZone,
  Matches,
} from 'class-validator';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class StartWorkoutDto {
  @ApiProperty({ example: 'Asia/Qatar' })
  @Transform(trim)
  @IsString()
  @IsTimeZone()
  timezone!: string;

  @ApiPropertyOptional({ example: 'upper-a' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  routineSlug?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startedAt?: Date;
}
