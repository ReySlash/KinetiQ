export type AnalyticsOverviewQuery = {
  ownerId: string;
  timezone: string;
  from?: Date;
  to?: Date;
};

export type AnalyticsSourceSet = {
  repetitions: number;
  loadKg: string;
  isWarmup: boolean;
};

export type AnalyticsSourcePerformance = {
  exerciseId: string;
  exerciseNameSnapshot: string;
  completedSets: AnalyticsSourceSet[];
};

export type AnalyticsSourceSession = {
  id: string;
  startedAt: Date;
  createdAt: Date;
  completedAt: Date | null;
  cancelledAt: Date | null;
  performances: AnalyticsSourcePerformance[];
};

export type AnalyticsVolumeStatus = 'COMPLETE' | 'PARTIAL' | 'UNAVAILABLE';

export type AnalyticsVolumeCompleteness = {
  status: AnalyticsVolumeStatus;
  includedSetCount: number;
  excludedSetCount: number;
};

export type WeeklyTrainingSummary = {
  weekStart: string;
  weekEnd: string;
  completedWorkouts: number;
  trainingDays: number;
  completedWorkingSets: number;
  warmupSets: number;
  totalRepetitions: number;
  volumeLoadKg: string | null;
  volumeCompleteness: AnalyticsVolumeCompleteness;
};

export type ExerciseFrequencySummary = {
  exerciseId: string;
  exerciseNameSnapshot: string;
  completedWorkoutCount: number;
  completedWorkingSetCount: number;
  totalRepetitions: number;
  volumeLoadKg: string | null;
  volumeCompleteness: AnalyticsVolumeCompleteness;
};

export type AnalyticsOverview = {
  period: {
    from: string;
    to: string;
    timezone: string;
    includesPartialCurrentWeek: boolean;
  };
  totals: {
    completedWorkouts: number;
    trainingDays: number;
    completedWorkingSets: number;
    warmupSets: number;
    totalRepetitions: number;
    volumeLoadKg: string | null;
    activeWeeks: number;
    completeWeeks: number;
    averageWorkoutsPerCompleteWeek: number;
  };
  volumeCompleteness: AnalyticsVolumeCompleteness;
  weekly: WeeklyTrainingSummary[];
  exercises: ExerciseFrequencySummary[];
};
