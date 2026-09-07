export type AnalyticsVolumeStatus = "COMPLETE" | "PARTIAL" | "UNAVAILABLE";

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
  exerciseSlug: string;
  exerciseNameSnapshot: string;
  completedWorkoutCount: number;
  completedWorkingSetCount: number;
  totalRepetitions: number;
  maximumLoadKg: string | null;
  lastWorkingSet: {
    repetitions: number;
    loadKg: string;
    completedAt: string;
  } | null;
  volumeLoadKg: string | null;
  volumeCompleteness: AnalyticsVolumeCompleteness;
};

export type RecentWorkoutSummary = {
  workoutSessionId: string;
  displayName: string;
  startedAt: string;
  completedAt: string;
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
  recentWorkouts: RecentWorkoutSummary[];
  comparison: {
    period: { from: string; to: string };
    totals: AnalyticsOverview["totals"];
    volumeCompleteness: AnalyticsVolumeCompleteness;
  };
};

export type AnalyticsRange = "1w" | "2w" | "4w" | "26w" | "52w";
export type AnalyticsMetric = "workouts" | "sets" | "repetitions" | "volume";
