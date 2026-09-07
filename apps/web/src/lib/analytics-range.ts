import type { AnalyticsOverviewRequest } from "@/lib/analytics-api";
import type { AnalyticsRange } from "@/types/analytics-types";

const CLIENT_CLOCK_SKEW_MILLISECONDS = 60_000;

export type AnalyticsRangeInput = {
  range: AnalyticsRange;
  now?: Date;
};

export type AnalyticsRangeResult =
  | { ok: true; request: AnalyticsOverviewRequest }
  | { ok: false; message: string };

export function buildAnalyticsRequest(
  timezone: string,
  input: AnalyticsRangeInput,
): AnalyticsRangeResult {
  if (!timezone.trim()) {
    return { ok: false, message: "Your timezone could not be detected." };
  }

  const weeks = Number.parseInt(input.range, 10);
  const currentTime = input.now ?? new Date();
  const requestEnd = input.now
    ? currentTime
    : new Date(currentTime.getTime() - CLIENT_CLOCK_SKEW_MILLISECONDS);
  const currentMonday = startOfWeekInTimezone(currentTime, timezone);
  currentMonday.setDate(currentMonday.getDate() - (weeks - 1) * 7);

  return {
    ok: true,
    request: {
      timezone,
      from: currentMonday.toISOString(),
      to: requestEnd.toISOString(),
    },
  };
}

export function startOfLocalWeek(value: Date): Date {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  const daysSinceMonday = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - daysSinceMonday);
  return date;
}

export function startOfWeekInTimezone(value: Date, timezone: string): Date {
  const localDate = dateKeyInTimezone(value, timezone);
  const [year, month, day] = localDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - daysSinceMonday);
  return localDateAtStart(toDateKey(date), timezone);
}

export function toDateKey(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function dateKeyInTimezone(value: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const values = Object.fromEntries(
    parts
      .filter(({ type }) => type !== "literal")
      .map(({ type, value: partValue }) => [type, partValue]),
  );
  return `${values.year}-${values.month}-${values.day}`;
}

export function formatDateKey(value: string, timezone: string): string {
  void timezone;
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

function localDateAtStart(value: string, timezone: string): Date {
  return zonedDate(value, "00:00:00.000", timezone);
}

function zonedDate(value: string, time: string, timezone: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  const [hour, minute, second, millisecond] = time
    .split(/[:.]/)
    .map(Number);
  const naiveUtc = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);
  const firstOffset = timezoneOffsetAt(new Date(naiveUtc), timezone);
  const firstGuess = new Date(naiveUtc - firstOffset);
  const secondOffset = timezoneOffsetAt(firstGuess, timezone);
  return new Date(naiveUtc - secondOffset);
}

function timezoneOffsetAt(value: Date, timezone: string): number {
  const timeZoneName = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "longOffset",
  })
    .formatToParts(value)
    .find(({ type }) => type === "timeZoneName")?.value;
  if (!timeZoneName || timeZoneName === "GMT") return 0;
  const match = timeZoneName.match(/^GMT([+-])(\d{1,2})(?::(\d{2}))?$/);
  if (!match) return 0;
  const minutes = Number(match[2]) * 60 + Number(match[3] ?? 0);
  return (match[1] === "+" ? 1 : -1) * minutes * 60_000;
}
