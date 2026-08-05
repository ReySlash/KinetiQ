import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoutineVisibility } from '../../../generated/prisma/client';

export class RoutineMutationResponseDto {
  @ApiProperty({ example: 'Routine updated successfully' })
  message!: string;
}

export class RoutineListItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'upper-body-a' })
  slug!: string;

  @ApiProperty({ example: 'Upper Body A' })
  name!: string;

  @ApiPropertyOptional({ nullable: true, example: 'Pressing day' })
  description!: string | null;

  @ApiProperty({ enum: RoutineVisibility, enumName: 'RoutineVisibility' })
  visibility!: RoutineVisibility;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: Date;

  @ApiProperty({ example: 5 })
  exerciseCount!: number;
}

export class RoutineExerciseReferenceDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Bench Press' })
  name!: string;

  @ApiProperty({ example: 'bench-press' })
  slug!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiPropertyOptional({ nullable: true, format: 'date-time' })
  archivedAt!: Date | null;
}

export class RoutineExerciseResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'bench-press' })
  exerciseSlug!: string;

  @ApiProperty({ example: 0 })
  order!: number;

  @ApiProperty({ example: 3 })
  sets!: number;

  @ApiProperty({ example: 8 })
  minReps!: number;

  @ApiProperty({ example: 12 })
  maxReps!: number;

  @ApiPropertyOptional({ nullable: true, example: 2 })
  targetRir!: number | null;

  @ApiPropertyOptional({ nullable: true, example: 120 })
  restSeconds!: number | null;

  @ApiPropertyOptional({ nullable: true, example: '3-1-X-0' })
  tempo!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Controlled reps' })
  notes!: string | null;

  @ApiProperty({ type: RoutineExerciseReferenceDto })
  exercise!: RoutineExerciseReferenceDto;
}

export class RoutineDetailDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'upper-body-a' })
  slug!: string;

  @ApiProperty({ example: 'Upper Body A' })
  name!: string;

  @ApiPropertyOptional({ nullable: true, example: 'Pressing day' })
  description!: string | null;

  @ApiProperty({ enum: RoutineVisibility, enumName: 'RoutineVisibility' })
  visibility!: RoutineVisibility;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: Date;

  @ApiProperty({ type: [RoutineExerciseResponseDto] })
  exercises!: RoutineExerciseResponseDto[];
}
