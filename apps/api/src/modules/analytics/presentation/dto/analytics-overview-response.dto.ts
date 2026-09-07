import { ApiProperty } from '@nestjs/swagger';

const VOLUME_STATUSES = ['COMPLETE', 'PARTIAL', 'UNAVAILABLE'] as const;

export class AnalyticsVolumeCompletenessResponseDto {
  @ApiProperty({ enum: VOLUME_STATUSES })
  status!: (typeof VOLUME_STATUSES)[number];

  @ApiProperty()
  includedSetCount!: number;

  @ApiProperty()
  excludedSetCount!: number;
}

export class WeeklyTrainingSummaryResponseDto {
  @ApiProperty({ example: '2026-08-31' })
  weekStart!: string;

  @ApiProperty({ example: '2026-09-06' })
  weekEnd!: string;

  @ApiProperty()
  completedWorkouts!: number;

  @ApiProperty()
  trainingDays!: number;

  @ApiProperty()
  completedWorkingSets!: number;

  @ApiProperty()
  warmupSets!: number;

  @ApiProperty()
  totalRepetitions!: number;

  @ApiProperty({ nullable: true, example: '1250.50' })
  volumeLoadKg!: string | null;

  @ApiProperty({ type: AnalyticsVolumeCompletenessResponseDto })
  volumeCompleteness!: AnalyticsVolumeCompletenessResponseDto;
}

export class ExerciseFrequencySummaryResponseDto {
  @ApiProperty({ format: 'uuid' })
  exerciseId!: string;

  @ApiProperty()
  exerciseSlug!: string;

  @ApiProperty()
  exerciseNameSnapshot!: string;

  @ApiProperty()
  completedWorkoutCount!: number;

  @ApiProperty()
  completedWorkingSetCount!: number;

  @ApiProperty()
  totalRepetitions!: number;

  @ApiProperty({ nullable: true, example: '120.00' })
  maximumLoadKg!: string | null;

  @ApiProperty({
    nullable: true,
    type: () => AnalyticsLastWorkingSetResponseDto,
  })
  lastWorkingSet!: AnalyticsLastWorkingSetResponseDto | null;

  @ApiProperty({ nullable: true, example: '1250.50' })
  volumeLoadKg!: string | null;

  @ApiProperty({ type: AnalyticsVolumeCompletenessResponseDto })
  volumeCompleteness!: AnalyticsVolumeCompletenessResponseDto;
}

export class AnalyticsLastWorkingSetResponseDto {
  @ApiProperty()
  repetitions!: number;

  @ApiProperty({ example: '95.00' })
  loadKg!: string;

  @ApiProperty({ format: 'date-time' })
  completedAt!: string;
}

export class AnalyticsPeriodResponseDto {
  @ApiProperty({ format: 'date-time' })
  from!: string;

  @ApiProperty({ format: 'date-time' })
  to!: string;

  @ApiProperty({ example: 'Asia/Qatar' })
  timezone!: string;

  @ApiProperty()
  includesPartialCurrentWeek!: boolean;
}

export class AnalyticsTotalsResponseDto {
  @ApiProperty()
  completedWorkouts!: number;

  @ApiProperty()
  trainingDays!: number;

  @ApiProperty()
  completedWorkingSets!: number;

  @ApiProperty()
  warmupSets!: number;

  @ApiProperty()
  totalRepetitions!: number;

  @ApiProperty({ nullable: true, example: '1250.50' })
  volumeLoadKg!: string | null;

  @ApiProperty()
  activeWeeks!: number;

  @ApiProperty()
  completeWeeks!: number;

  @ApiProperty({ example: 2.5 })
  averageWorkoutsPerCompleteWeek!: number;
}

export class AnalyticsComparisonPeriodResponseDto {
  @ApiProperty({ format: 'date-time' })
  from!: string;

  @ApiProperty({ format: 'date-time' })
  to!: string;
}

export class AnalyticsComparisonResponseDto {
  @ApiProperty({ type: AnalyticsComparisonPeriodResponseDto })
  period!: AnalyticsComparisonPeriodResponseDto;

  @ApiProperty({ type: AnalyticsTotalsResponseDto })
  totals!: AnalyticsTotalsResponseDto;

  @ApiProperty({ type: AnalyticsVolumeCompletenessResponseDto })
  volumeCompleteness!: AnalyticsVolumeCompletenessResponseDto;
}

export class RecentWorkoutSummaryResponseDto {
  @ApiProperty({ format: 'uuid' })
  workoutSessionId!: string;

  @ApiProperty()
  displayName!: string;

  @ApiProperty({ format: 'date-time' })
  startedAt!: string;

  @ApiProperty({ format: 'date-time' })
  completedAt!: string;

  @ApiProperty()
  completedWorkingSetCount!: number;

  @ApiProperty()
  totalRepetitions!: number;

  @ApiProperty({ nullable: true, example: '1250.50' })
  volumeLoadKg!: string | null;

  @ApiProperty({ type: AnalyticsVolumeCompletenessResponseDto })
  volumeCompleteness!: AnalyticsVolumeCompletenessResponseDto;
}

export class AnalyticsOverviewResponseDto {
  @ApiProperty({ type: AnalyticsPeriodResponseDto })
  period!: AnalyticsPeriodResponseDto;

  @ApiProperty({ type: AnalyticsTotalsResponseDto })
  totals!: AnalyticsTotalsResponseDto;

  @ApiProperty({ type: AnalyticsVolumeCompletenessResponseDto })
  volumeCompleteness!: AnalyticsVolumeCompletenessResponseDto;

  @ApiProperty({ type: [WeeklyTrainingSummaryResponseDto] })
  weekly!: WeeklyTrainingSummaryResponseDto[];

  @ApiProperty({ type: [ExerciseFrequencySummaryResponseDto] })
  exercises!: ExerciseFrequencySummaryResponseDto[];

  @ApiProperty({ type: [RecentWorkoutSummaryResponseDto] })
  recentWorkouts!: RecentWorkoutSummaryResponseDto[];

  @ApiProperty({ type: AnalyticsComparisonResponseDto })
  comparison!: AnalyticsComparisonResponseDto;
}
