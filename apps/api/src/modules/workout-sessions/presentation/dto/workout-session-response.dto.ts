import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WorkoutSessionMutationResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ enum: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'] })
  status!: string;
  @ApiProperty({ format: 'date-time' }) updatedAt!: Date;
  @ApiProperty() version!: number;
}

export class CompletedSetResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() order!: number;
  @ApiProperty() repetitions!: number;
  @ApiProperty() loadKg!: string;
  @ApiProperty({ enum: ['KG', 'LB'] }) loadUnit!: string;
  @ApiPropertyOptional({ nullable: true }) rir!: number | null;
  @ApiProperty() isWarmup!: boolean;
  @ApiProperty({ format: 'date-time' }) completedAt!: Date;
}

export class ExercisePerformanceResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) exerciseId!: string;
  @ApiProperty() exerciseNameSnapshot!: string;
  @ApiProperty() order!: number;
  @ApiPropertyOptional({ nullable: true }) targetSetCount!: number | null;
  @ApiPropertyOptional({ nullable: true }) targetMinReps!: number | null;
  @ApiPropertyOptional({ nullable: true }) targetMaxReps!: number | null;
  @ApiPropertyOptional({ nullable: true }) targetRir!: number | null;
  @ApiPropertyOptional({ nullable: true }) targetRestSeconds!: number | null;
  @ApiPropertyOptional({ nullable: true }) targetTempo!: string | null;
  @ApiPropertyOptional({ nullable: true }) prescriptionNotes!: string | null;
  @ApiProperty({ type: [CompletedSetResponseDto] })
  completedSets!: CompletedSetResponseDto[];
}

export class WorkoutSessionDetailResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ enum: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'] })
  status!: string;
  @ApiPropertyOptional({ nullable: true, format: 'uuid' }) sourceRoutineId!:
    string | null;
  @ApiPropertyOptional({ nullable: true }) sourceRoutineNameSnapshot!:
    string | null;
  @ApiProperty() timezone!: string;
  @ApiProperty({ format: 'date-time' }) startedAt!: Date;
  @ApiPropertyOptional({ nullable: true, format: 'date-time' })
  completedAt!: Date | null;
  @ApiPropertyOptional({ nullable: true, format: 'date-time' })
  cancelledAt!: Date | null;
  @ApiProperty({ format: 'date-time' }) createdAt!: Date;
  @ApiProperty({ format: 'date-time' }) updatedAt!: Date;
  @ApiProperty({ type: [ExercisePerformanceResponseDto] })
  performances!: ExercisePerformanceResponseDto[];
}

export class WorkoutSessionListItemResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ enum: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'] })
  status!: string;
  @ApiProperty({ format: 'date-time' }) updatedAt!: Date;
  @ApiPropertyOptional({ nullable: true }) sourceRoutineNameSnapshot!:
    string | null;
  @ApiProperty() timezone!: string;
  @ApiProperty({ format: 'date-time' }) startedAt!: Date;
  @ApiPropertyOptional({ nullable: true, format: 'date-time' })
  completedAt!: Date | null;
  @ApiPropertyOptional({ nullable: true, format: 'date-time' })
  cancelledAt!: Date | null;
  @ApiProperty() completedSetCount!: number;
}

export class ExerciseHistoryResponseDto {
  @ApiProperty({ format: 'uuid' }) workoutSessionId!: string;
  @ApiProperty({ enum: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'] })
  sessionStatus!: string;
  @ApiProperty({ format: 'date-time' }) sessionStartedAt!: Date;
  @ApiProperty({ format: 'uuid' }) exercisePerformanceId!: string;
  @ApiProperty() exerciseNameSnapshot!: string;
  @ApiProperty({ type: Object }) prescription!: Record<string, unknown>;
  @ApiProperty({ type: [CompletedSetResponseDto] })
  completedSets!: CompletedSetResponseDto[];
}
