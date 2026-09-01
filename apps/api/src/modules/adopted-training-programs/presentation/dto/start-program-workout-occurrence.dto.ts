import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsString, IsTimeZone, ValidateIf } from 'class-validator';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class StartProgramWorkoutOccurrenceDto {
  @ApiProperty({ example: 'Asia/Qatar' })
  @Transform(trim)
  @IsString()
  @IsTimeZone()
  timezone!: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @ValidateIf((_object, value) => value !== undefined)
  @Type(() => Date)
  @IsDate()
  startedAt?: Date;
}
