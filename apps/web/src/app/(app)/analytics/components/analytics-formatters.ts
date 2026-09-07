import type { AnalyticsMetric, AnalyticsVolumeCompleteness, ExerciseFrequencySummary } from "@/types/analytics-types";
import { formatDateKey } from "@/lib/analytics-range";
import { formatLoad } from "@/lib/analytics-metrics";

export { formatLoad };

export function formatChartValue(value: number, metric: AnalyticsMetric): string {
  if (metric !== "volume" || Math.abs(value) < 1000) return String(value);
  const compactValue = value / 1000;
  return `${Number.isInteger(compactValue) ? compactValue : compactValue.toFixed(1)}k`;
}

export function formatDateTime(value: string, timezone: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short", timeZone: timezone }).format(new Date(value));
}

export function formatNumber(value: number): string { return new Intl.NumberFormat().format(value); }
export function formatVolume(value: string | null): string { return value === null ? "Not available" : `${formatNumber(Number(value))} kg`; }
export function formatLastSet(exercise: ExerciseFrequencySummary, timezone: string): string {
  if (!exercise.lastWorkingSet) return "Not available";
  return `${formatLoad(exercise.lastWorkingSet.loadKg)} × ${exercise.lastWorkingSet.repetitions} · ${formatDateTime(exercise.lastWorkingSet.completedAt, timezone)}`;
}

export function formatWeekLabel(weekStart: string, weekEnd: string, timezone: string): string {
  return `${formatDateKey(weekStart, timezone)} – ${formatDateKey(weekEnd, timezone)}`;
}

export function volumeStatusLabel(completeness: AnalyticsVolumeCompleteness): string {
  return completeness.status[0] + completeness.status.slice(1).toLowerCase();
}
