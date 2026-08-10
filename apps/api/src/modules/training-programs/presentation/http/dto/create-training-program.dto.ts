import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

function trimString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreateTrainingProgramScheduleEntryDto {
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  routineSlug!: string;

  @IsInt()
  weekNumber!: number;

  @IsInt()
  dayNumber!: number;

  @Transform(({ value }) => trimString(value))
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string | null;
}

export class CreateTrainingProgramDto {
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @Transform(({ value }) => trimString(value))
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description!: string | null;

  @IsInt()
  @Min(1)
  durationWeeks!: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => trimString(value))
  @MinLength(2)
  @MaxLength(120)
  slug?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTrainingProgramScheduleEntryDto)
  schedule?: CreateTrainingProgramScheduleEntryDto[];
}
