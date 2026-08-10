import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

function trimString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
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
}
