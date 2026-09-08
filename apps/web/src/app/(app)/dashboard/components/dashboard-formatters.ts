import type {
  AnalyticsVolumeCompleteness,
  RecentWorkoutSummary,
} from "@/types/analytics-types";

export function formatDashboardNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

export function formatDashboardVolume(value: string | null): string {
  return value === null
    ? "Not available"
    : `${new Intl.NumberFormat().format(Number(value))} kg`;
}

export function formatDashboardDateTime(
  value: string,
  timezone: string,
): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(value));
}

export function formatDashboardVolumeStatus(
  completeness: AnalyticsVolumeCompleteness,
): string | null {
  if (completeness.status === "UNAVAILABLE") return "Load unavailable";
  if (completeness.status === "PARTIAL") {
    const suffix = completeness.excludedSetCount === 1 ? "" : "s";
    return `${completeness.excludedSetCount} set${suffix} excluded`;
  }
  return null;
}

export function workoutLabel(workout: RecentWorkoutSummary): string {
  return workout.displayName || "Workout";
}
