import type {
  AnalyticsMetric,
  ExerciseFrequencySummary,
} from "@/types/analytics-types";

export type ExerciseSortMetric = Exclude<AnalyticsMetric, "workouts">;

export function exerciseMetricValue(
  exercise: ExerciseFrequencySummary,
  metric: ExerciseSortMetric,
): number {
  if (metric === "sets") return exercise.completedWorkingSetCount;
  if (metric === "repetitions") return exercise.totalRepetitions;
  return exercise.volumeLoadKg === null ? 0 : Number(exercise.volumeLoadKg);
}

export function orderExercisesByMetric(
  exercises: ExerciseFrequencySummary[],
  metric: ExerciseSortMetric,
): ExerciseFrequencySummary[] {
  return [...exercises].sort(
    (left, right) =>
      exerciseMetricValue(right, metric) - exerciseMetricValue(left, metric) ||
      compareCodePoints(
        left.exerciseNameSnapshot,
        right.exerciseNameSnapshot,
      ) ||
      compareCodePoints(left.exerciseId, right.exerciseId),
  );
}

function compareCodePoints(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}
