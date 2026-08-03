import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  ArrayMaxSize,
  ArrayMinSize,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Matches,
  Min,
  MinLength,
  Validate,
  ValidateNested,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

function trimRequiredString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

function trimNullableString(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  return typeof value === 'string' ? value.trim() : value;
}

@ValidatorConstraint({ name: 'maxRepsValidator', async: false })
class MaxRepsValidator implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const exercise = args.object as CreateRoutineExerciseDto;
    return (
      typeof value === 'number' &&
      typeof exercise.maxReps === 'number' &&
      value <= exercise.maxReps
    );
  }

  defaultMessage(): string {
    return 'minReps must be less than or equal to maxReps.';
  }
}

export class CreateRoutineExerciseDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  exerciseId!: string;

  @ApiProperty({ minimum: 1, maximum: 20, example: 3 })
  @IsInt()
  @Min(1)
  @Max(20)
  sets!: number;

  @ApiProperty({ minimum: 1, maximum: 1000, example: 8 })
  @IsInt()
  @Min(1)
  @Max(1000)
  @Validate(MaxRepsValidator)
  minReps!: number;

  @ApiProperty({ minimum: 1, maximum: 1000, example: 12 })
  @IsInt()
  @Min(1)
  @Max(1000)
  maxReps!: number;

  @ApiPropertyOptional({ nullable: true, minimum: 0, maximum: 10, example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  targetRir?: number | null;

  @ApiPropertyOptional({
    nullable: true,
    minimum: 0,
    maximum: 3600,
    example: 120,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3600)
  restSeconds?: number | null;

  @ApiPropertyOptional({ nullable: true, example: '3-1-X-0' })
  @IsOptional()
  @Transform(({ value }) => trimNullableString(value))
  @IsString()
  @MaxLength(30)
  @Matches(/^(?:[0-9]|X)(?:-(?:[0-9]|X)){3}$/)
  tempo?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    maxLength: 1000,
    example: 'Controlled reps',
  })
  @IsOptional()
  @Transform(({ value }) => trimNullableString(value))
  @IsString()
  @MaxLength(1000)
  notes?: string | null;
}

export class CreateRoutineDto {
  @ApiProperty({ minLength: 2, maxLength: 120, example: 'Upper Body A' })
  @Transform(({ value }) => trimRequiredString(value))
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({
    nullable: true,
    maxLength: 2000,
    example: 'Pressing day',
  })
  @IsOptional()
  @Transform(({ value }) => trimNullableString(value))
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @ApiProperty({ type: [CreateRoutineExerciseDto], maxItems: 50 })
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CreateRoutineExerciseDto)
  exercises!: CreateRoutineExerciseDto[];
}

export function normalizeRoutineStrings<
  T extends {
    name?: string;
    description?: string | null;
    exercises?: CreateRoutineExerciseDto[];
  },
>(dto: T): T {
  if (dto.name !== undefined) {
    dto.name = trimRequiredString(dto.name) as string;
  }
  dto.description = trimNullableString(dto.description) as
    string | null | undefined;

  for (const exercise of dto.exercises ?? []) {
    exercise.tempo = trimNullableString(exercise.tempo) as
      string | null | undefined;
    exercise.notes = trimNullableString(exercise.notes) as
      string | null | undefined;
  }

  return dto;
}
