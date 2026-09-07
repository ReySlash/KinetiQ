import type {
  AnalyticsVolumeStatus,
  ExerciseFrequencySummary,
} from "@/types/analytics-types";

export function metricDelta(current: number, previous: number): string {
  if (previous === 0) return current === 0 ? "No change" : "New";
  const percentage = ((current - previous) / previous) * 100;
  const formatted = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
  }).format(Math.abs(percentage));
  return `${percentage > 0 ? "+" : percentage < 0 ? "-" : ""}${formatted}%`;
}

export function volumeDelta(
  current: string | null,
  previous: string | null,
  currentStatus: AnalyticsVolumeStatus,
  previousStatus: AnalyticsVolumeStatus,
): string | null {
  if (
    currentStatus !== "COMPLETE" ||
    previousStatus !== "COMPLETE" ||
    current === null ||
    previous === null
  ) {
    return null;
  }
  return metricDelta(Number(current), Number(previous));
}

export function formatLoad(value: string | null): string {
  if (value === null) return "Not available";
  const number = Number(value);
  if (!Number.isFinite(number)) return "Not available";
  if (number === 0) return "No external load";
  return `${new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(number)} kg`;
}

export function orderAnalyticsExercises(
  exercises: ExerciseFrequencySummary[],
): ExerciseFrequencySummary[] {
  return [...exercises].sort(
    (left, right) =>
      right.completedWorkingSetCount - left.completedWorkingSetCount ||
      left.exerciseNameSnapshot.localeCompare(right.exerciseNameSnapshot) ||
      left.exerciseId.localeCompare(right.exerciseId),
  );
}
