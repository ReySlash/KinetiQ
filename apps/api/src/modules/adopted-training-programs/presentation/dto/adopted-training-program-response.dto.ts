import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdoptedTrainingProgramMutationResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ enum: ['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'] })
  status!: string;
  @ApiProperty({ format: 'date-time' }) updatedAt!: Date;
}

export class AdoptTrainingProgramResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ enum: ['ACTIVE'] }) status!: string;
  @ApiProperty({ format: 'date-time' }) startedAt!: Date;
}

export class StartProgramWorkoutOccurrenceResponseDto {
  @ApiProperty({ format: 'uuid' }) workoutSessionId!: string;
  @ApiProperty({ format: 'uuid' }) occurrenceId!: string;
  @ApiProperty({ enum: ['IN_PROGRESS'] }) sessionStatus!: string;
  @ApiProperty({ enum: ['IN_PROGRESS'] }) occurrenceStatus!: string;
}

export class ProgramWorkoutOccurrenceDetailResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() weekNumber!: number;
  @ApiProperty() dayNumber!: number;
  @ApiProperty() routineNameSnapshot!: string;
  @ApiPropertyOptional({ nullable: true }) programSlotNotesSnapshot!:
    string | null;
  @ApiProperty({ enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'] })
  status!: string;
  @ApiProperty() sourceRoutineAvailable!: boolean;
  @ApiProperty({ type: [String] }) sessionAttemptIds!: string[];
  @ApiPropertyOptional({ nullable: true, format: 'uuid' }) activeSessionId!:
    string | null;
  @ApiPropertyOptional({ nullable: true, format: 'uuid' }) latestSessionId!:
    string | null;
}

export class AdoptedTrainingProgramActionsResponseDto {
  @ApiProperty() canPause!: boolean;
  @ApiProperty() canResume!: boolean;
  @ApiProperty() canCancel!: boolean;
  @ApiProperty() canStartNext!: boolean;
  @ApiProperty() canSkipNext!: boolean;
}

export class AdoptedTrainingProgramDetailResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() programNameSnapshot!: string;
  @ApiProperty({ enum: ['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'] })
  status!: string;
  @ApiProperty() durationWeeksSnapshot!: number;
  @ApiProperty({ format: 'date-time' }) startedAt!: Date;
  @ApiPropertyOptional({ nullable: true, format: 'date-time' })
  completedAt!: Date | null;
  @ApiPropertyOptional({ nullable: true, format: 'date-time' })
  cancelledAt!: Date | null;
  @ApiProperty() totalCount!: number;
  @ApiProperty() completedCount!: number;
  @ApiProperty() skippedCount!: number;
  @ApiProperty() resolvedCount!: number;
  @ApiProperty() progressPercent!: number;
  @ApiProperty({ type: [ProgramWorkoutOccurrenceDetailResponseDto] })
  occurrences!: ProgramWorkoutOccurrenceDetailResponseDto[];
  @ApiPropertyOptional({
    nullable: true,
    type: ProgramWorkoutOccurrenceDetailResponseDto,
  })
  nextPendingOccurrence!: ProgramWorkoutOccurrenceDetailResponseDto | null;
  @ApiProperty({ type: AdoptedTrainingProgramActionsResponseDto })
  actions!: AdoptedTrainingProgramActionsResponseDto;
}
