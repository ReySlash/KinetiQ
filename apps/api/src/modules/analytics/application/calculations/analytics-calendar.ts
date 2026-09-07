const DAY_MILLISECONDS = 24 * 60 * 60 * 1000;
const SEARCH_WINDOW_MILLISECONDS = 72 * 60 * 60 * 1000;
const SEARCH_STEP_MILLISECONDS = 60 * 60 * 1000;

type CalendarParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
};

type CalendarDate = { year: number; month: number; day: number };

const canonicalTimezoneByIdentifier = new Map<string, string>();
const partsFormatterByCanonicalTimezone = new Map<
  string,
  Intl.DateTimeFormat
>();

export { DAY_MILLISECONDS };

export function validateIanaTimezone(timezone: string): void {
  canonicalTimezone(timezone);
}

export function localWeekStartInstant(date: Date, timezone: string): Date {
  return localDateStart(weekStartKey(localDateKey(date, timezone)), timezone);
}

export function localDateStart(dateKey: string, timezone: string): Date {
  return localWallClockToUtc(parseDateKey(dateKey), timezone);
}

export function localDateKey(date: Date, timezone: string): string {
  return formatDateKey(getCalendarParts(date, timezone));
}

export function weekStartKey(dateKey: string): string {
  const date = parseDateKey(dateKey);
  const day = new Date(
    Date.UTC(date.year, date.month - 1, date.day),
  ).getUTCDay();
  return addCalendarDate(dateKey, day === 0 ? -6 : 1 - day);
}

export function addCalendarDays(
  date: Date,
  days: number,
  timezone: string,
): Date {
  return localDateStart(
    addCalendarDate(localDateKey(date, timezone), days),
    timezone,
  );
}

export function addCalendarDate(dateKey: string, days: number): string {
  const date = parseDateKey(dateKey);
  const shifted = new Date(
    Date.UTC(date.year, date.month - 1, date.day) + days * DAY_MILLISECONDS,
  );
  return formatDateKey({
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  });
}

export function localWallClockDistance(
  from: Date,
  to: Date,
  timezone: string,
): number {
  return wallClockEpoch(to, timezone) - wallClockEpoch(from, timezone);
}

function wallClockEpoch(date: Date, timezone: string): number {
  const parts = getCalendarParts(date, timezone);
  return Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    parts.millisecond,
  );
}

function canonicalTimezone(timezone: string): string {
  const cached = canonicalTimezoneByIdentifier.get(timezone);
  if (cached) return cached;

  const formatter = createPartsFormatter(timezone);
  const canonical = formatter.resolvedOptions().timeZone;
  canonicalTimezoneByIdentifier.set(timezone, canonical);
  canonicalTimezoneByIdentifier.set(canonical, canonical);
  if (!partsFormatterByCanonicalTimezone.has(canonical)) {
    partsFormatterByCanonicalTimezone.set(canonical, formatter);
  }
  return canonical;
}

function createPartsFormatter(timezone: string): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  });
}

function getCalendarParts(date: Date, timezone: string): CalendarParts {
  const canonical = canonicalTimezone(timezone);
  const formatter = partsFormatterByCanonicalTimezone.get(canonical);
  if (!formatter) {
    throw new Error('Analytics timezone formatter is unavailable.');
  }
  const values = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, Number(value)]),
  ) as Record<string, number>;
  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour === 24 ? 0 : values.hour,
    minute: values.minute,
    second: values.second,
    millisecond: values.fractionalSecond,
  };
}

function parseDateKey(value: string): CalendarDate {
  const [year, month, day] = value.split('-').map(Number);
  return { year, month, day };
}

function formatDateKey(
  parts: Pick<CalendarParts, 'year' | 'month' | 'day'>,
): string {
  return [parts.year, parts.month, parts.day]
    .map((value, index) =>
      index === 0
        ? String(value).padStart(4, '0')
        : String(value).padStart(2, '0'),
    )
    .join('-');
}

function localWallClockToUtc(date: CalendarDate, timezone: string): Date {
  const target = Date.UTC(date.year, date.month - 1, date.day);
  let candidate = target;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    candidate += target - wallClockEpoch(new Date(candidate), timezone);
  }

  const candidateDate = new Date(candidate);
  const candidateParts = getCalendarParts(candidateDate, timezone);
  if (
    formatDateKey(candidateParts) === formatDateKey(date) &&
    candidateParts.hour === 0 &&
    candidateParts.minute === 0 &&
    candidateParts.second === 0 &&
    candidateParts.millisecond === 0 &&
    localDateKey(new Date(candidate - 1), timezone) < formatDateKey(date)
  ) {
    return candidateDate;
  }

  return searchFirstInstantOnOrAfterDate(date, timezone, target);
}

function searchFirstInstantOnOrAfterDate(
  date: CalendarDate,
  timezone: string,
  target: number,
): Date {
  const targetKey = formatDateKey(date);
  const searchStart = target - SEARCH_WINDOW_MILLISECONDS;
  const searchEnd = target + SEARCH_WINDOW_MILLISECONDS;
  let previous = searchStart;

  for (
    let current = searchStart + SEARCH_STEP_MILLISECONDS;
    current <= searchEnd;
    current += SEARCH_STEP_MILLISECONDS
  ) {
    if (localDateKey(new Date(current), timezone) >= targetKey) {
      return new Date(
        findFirstMatchingInstant(previous, current, targetKey, timezone),
      );
    }
    previous = current;
  }

  throw new Error('Analytics local date boundary could not be resolved.');
}

function findFirstMatchingInstant(
  lowerBound: number,
  upperBound: number,
  targetKey: string,
  timezone: string,
): number {
  let lower = lowerBound;
  let upper = upperBound;
  while (lower < upper) {
    const midpoint = lower + Math.floor((upper - lower) / 2);
    if (localDateKey(new Date(midpoint), timezone) >= targetKey) {
      upper = midpoint;
    } else {
      lower = midpoint + 1;
    }
  }
  return lower;
}
