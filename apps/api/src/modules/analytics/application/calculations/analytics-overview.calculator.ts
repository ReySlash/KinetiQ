import {
  AnalyticsQueryError,
  AnalyticsValidationError,
} from '../errors/analytics.errors';
import type {
  AnalyticsOverviewCore,
  AnalyticsOverviewQuery,
  AnalyticsSourcePerformance,
  AnalyticsSourceSession,
  AnalyticsSourceSet,
  AnalyticsVolumeCompleteness,
  ExerciseFrequencySummary,
  WeeklyTrainingSummary,
} from '../models/analytics-overview.model';
import type { ResolvedAnalyticsOverviewQuery } from '../ports/analytics-query.port';
import {
  addCalendarDate,
  addCalendarDays,
  DAY_MILLISECONDS,
  localDateKey,
  localDateStart,
  localWallClockDistance,
  localWeekStartInstant,
  subtractLocalWallClockDuration,
  validateIanaTimezone,
  weekStartKey,
} from './analytics-calendar';

const MAX_LOCAL_RANGE_MILLISECONDS = 364 * DAY_MILLISECONDS;

type MutableMetrics = {
  completedWorkouts: number;
  trainingDays: Set<string>;
  completedWorkingSets: number;
  warmupSets: number;
  totalRepetitions: number;
  volumeCents: bigint;
  includedSetCount: number;
  excludedSetCount: number;
};

type WeeklyBucket = MutableMetrics & {
  weekStart: string;
  weekEnd: string;
  start: Date;
  end: Date;
};

type MutableExerciseMetrics = MutableMetrics & {
  exerciseId: string;
  exerciseSlug: string;
  exerciseNameSnapshot: string;
  completedWorkoutIds: Set<string>;
  maximumLoadCents: bigint | null;
  lastWorkingSet: AnalyticsSourceSet | null;
};

export function calculateAnalyticsOverview(
  query: ResolvedAnalyticsOverviewQuery,
  sessions: AnalyticsSourceSession[],
): AnalyticsOverviewCore {
  const period = createPeriod(query);
  const weeklyBuckets = createWeeklyBuckets(period, query.timezone);
  const weeklyByStart = new Map(
    weeklyBuckets.map((bucket) => [bucket.weekStart, bucket]),
  );
  const exercises = new Map<string, MutableExerciseMetrics>();
  const totals = createMetrics();
  sessions.forEach(validateSourceSession);
  const sortedSessions = [...sessions].sort(
    (left, right) =>
      left.startedAt.getTime() - right.startedAt.getTime() ||
      left.createdAt.getTime() - right.createdAt.getTime() ||
      left.id.localeCompare(right.id),
  );

  for (const session of sortedSessions) {
    const localDate = localDateKey(session.startedAt, query.timezone);
    const weekStart = weekStartKey(localDate);
    const bucket = weeklyByStart.get(weekStart);
    if (!bucket) continue;

    addWorkout(totals, localDate);
    addWorkout(bucket, localDate);

    const namesByExerciseId = new Map<string, string>();
    for (const performance of session.performances) {
      validatePerformance(performance, namesByExerciseId);
      if (performance.completedSets.length === 0) continue;
      const exercise =
        exercises.get(performance.exerciseId) ??
        createExerciseMetrics(performance);
      exercise.exerciseNameSnapshot = performance.exerciseNameSnapshot;
      exercise.completedWorkoutIds.add(session.id);
      exercises.set(performance.exerciseId, exercise);

      addPerformance(totals, performance, exercise);
      addPerformance(bucket, performance);
    }
  }

  const completeWeeks = weeklyBuckets.filter((bucket) =>
    isCompleteWeek(bucket, period.from, period.to, query),
  );
  const activeWeeks = weeklyBuckets.filter(
    (bucket) => bucket.completedWorkouts > 0,
  ).length;

  return {
    period: {
      from: query.from.toISOString(),
      to: query.to.toISOString(),
      timezone: query.timezone,
      includesPartialCurrentWeek: query.includesPartialCurrentWeek,
    },
    totals: {
      completedWorkouts: totals.completedWorkouts,
      trainingDays: totals.trainingDays.size,
      completedWorkingSets: totals.completedWorkingSets,
      warmupSets: totals.warmupSets,
      totalRepetitions: totals.totalRepetitions,
      volumeLoadKg: volumeValue(totals),
      activeWeeks,
      completeWeeks: completeWeeks.length,
      averageWorkoutsPerCompleteWeek: averageWorkouts(completeWeeks),
    },
    volumeCompleteness: volumeCompleteness(totals),
    weekly: weeklyBuckets.map(toWeeklySummary),
    exercises: [...exercises.values()]
      .sort(
        (left, right) =>
          compareCodePoints(
            left.exerciseNameSnapshot,
            right.exerciseNameSnapshot,
          ) || compareCodePoints(left.exerciseId, right.exerciseId),
      )
      .map(toExerciseSummary),
    recentWorkouts: [...sortedSessions]
      .sort(
        (left, right) =>
          (right.completedAt?.getTime() ?? 0) -
            (left.completedAt?.getTime() ?? 0) ||
          compareCodePoints(left.id, right.id),
      )
      .slice(0, 4)
      .map(toRecentWorkoutSummary),
  };
}

export function resolveAnalyticsComparisonQuery(
  query: ResolvedAnalyticsOverviewQuery,
): ResolvedAnalyticsOverviewQuery {
  const duration = localWallClockDistance(query.from, query.to, query.timezone);
  const from = subtractLocalWallClockDuration(
    query.from,
    duration,
    query.timezone,
  );
  return {
    ownerId: query.ownerId,
    timezone: query.timezone,
    from,
    to: new Date(query.from.getTime() - 1),
    includesPartialCurrentWeek: false,
    now: query.from,
  };
}

export function resolveAnalyticsOverviewQuery(
  query: AnalyticsOverviewQuery,
  now = new Date(),
): ResolvedAnalyticsOverviewQuery {
  const timezone = query.timezone.trim();
  validateTimezone(timezone);
  validateDate(now, 'Current date');
  if (query.from) validateDate(query.from, 'Analytics start date');
  if (query.to) validateDate(query.to, 'Analytics end date');
  if (Boolean(query.from) !== Boolean(query.to)) {
    throw new AnalyticsValidationError(
      'Analytics start and end dates must be provided together.',
    );
  }

  const currentWeekStart = localWeekStartInstant(now, timezone);
  const from = query.from ?? addCalendarDays(currentWeekStart, -21, timezone);
  const requestedTo = query.to;
  if (requestedTo && requestedTo > now) {
    throw new AnalyticsValidationError(
      'Analytics end date cannot be in the future.',
    );
  }
  const to = requestedTo ?? now;

  if (from >= to) {
    throw new AnalyticsValidationError(
      'Analytics start date must precede the end date.',
    );
  }
  if (
    localWallClockDistance(from, to, timezone) > MAX_LOCAL_RANGE_MILLISECONDS
  ) {
    throw new AnalyticsValidationError(
      'Analytics date range cannot exceed 52 weeks.',
    );
  }
  const currentWeekEnd = addCalendarDays(currentWeekStart, 7, timezone);
  const includesPartialCurrentWeek =
    from < currentWeekEnd && to >= currentWeekStart && to <= currentWeekEnd;

  return {
    ...query,
    timezone,
    from,
    to,
    includesPartialCurrentWeek,
    now,
  };
}

function createPeriod(query: ResolvedAnalyticsOverviewQuery) {
  return { from: query.from, to: query.to };
}

function createWeeklyBuckets(
  period: { from: Date; to: Date },
  timezone: string,
): WeeklyBucket[] {
  const firstKey = weekStartKey(localDateKey(period.from, timezone));
  const lastKey = weekStartKey(localDateKey(period.to, timezone));
  const buckets: WeeklyBucket[] = [];
  let current = firstKey;

  while (current <= lastKey) {
    const start = localDateStart(current, timezone);
    const end = addCalendarDays(start, 7, timezone);
    buckets.push({
      ...createMetrics(),
      weekStart: current,
      weekEnd: addCalendarDate(current, 6),
      start,
      end,
    });
    current = addCalendarDate(current, 7);
  }

  return buckets;
}

function isCompleteWeek(
  bucket: WeeklyBucket,
  from: Date,
  to: Date,
  query: ResolvedAnalyticsOverviewQuery,
): boolean {
  const withinRequestedPeriod = bucket.start >= from && bucket.end <= to;
  if (!withinRequestedPeriod) return false;
  if (query.now) return bucket.end <= query.now;

  // Resolved application queries always carry `now`. Keep direct calculator
  // callers deterministic when they provide only the documented projection.
  if (query.includesPartialCurrentWeek) {
    return (
      bucket.weekStart === weekStartKey(localDateKey(from, query.timezone))
    );
  }
  return true;
}

function createMetrics(): MutableMetrics {
  return {
    completedWorkouts: 0,
    trainingDays: new Set<string>(),
    completedWorkingSets: 0,
    warmupSets: 0,
    totalRepetitions: 0,
    volumeCents: 0n,
    includedSetCount: 0,
    excludedSetCount: 0,
  };
}

function createExerciseMetrics(
  performance: AnalyticsSourcePerformance,
): MutableExerciseMetrics {
  return {
    ...createMetrics(),
    exerciseId: performance.exerciseId,
    exerciseSlug: performance.exerciseSlug,
    exerciseNameSnapshot: performance.exerciseNameSnapshot,
    completedWorkoutIds: new Set<string>(),
    maximumLoadCents: null,
    lastWorkingSet: null,
  };
}

function addWorkout(metrics: MutableMetrics, localDate: string): void {
  metrics.completedWorkouts += 1;
  metrics.trainingDays.add(localDate);
}

function addPerformance(
  metrics: MutableMetrics,
  performance: AnalyticsSourcePerformance,
  exercise?: MutableExerciseMetrics,
): void {
  for (const set of performance.completedSets) {
    addSet(metrics, set);
    if (exercise) {
      addSet(exercise, set);
      addExerciseSet(exercise, set);
    }
  }
}

function addExerciseSet(
  metrics: MutableExerciseMetrics,
  set: AnalyticsSourceSet,
): void {
  if (set.isWarmup) return;
  if (!isValidDate(set.completedAt)) {
    throw new AnalyticsQueryError('Analytics data could not be loaded.');
  }
  const loadCents = parseLoadCents(set.loadKg);
  if (
    set.repetitions > 0 &&
    loadCents > 0n &&
    (metrics.maximumLoadCents === null || loadCents > metrics.maximumLoadCents)
  ) {
    metrics.maximumLoadCents = loadCents;
  }
  if (!metrics.lastWorkingSet || compareSets(set, metrics.lastWorkingSet) > 0) {
    metrics.lastWorkingSet = set;
  }
}

function compareSets(
  left: AnalyticsSourceSet,
  right: AnalyticsSourceSet,
): number {
  return (
    left.completedAt.getTime() - right.completedAt.getTime() ||
    left.order - right.order ||
    compareCodePoints(left.id, right.id)
  );
}

function addSet(metrics: MutableMetrics, set: AnalyticsSourceSet): void {
  validateRepetitions(set.repetitions);
  validateSet(set);
  if (set.isWarmup) {
    metrics.warmupSets += 1;
    return;
  }

  metrics.completedWorkingSets += 1;
  metrics.totalRepetitions += set.repetitions;
  const loadCents = parseLoadCents(set.loadKg);
  if (loadCents > 0n && set.repetitions > 0) {
    metrics.includedSetCount += 1;
    metrics.volumeCents += loadCents * BigInt(set.repetitions);
  } else {
    metrics.excludedSetCount += 1;
  }
}

function volumeCompleteness(
  metrics: MutableMetrics,
): AnalyticsVolumeCompleteness {
  const status =
    metrics.includedSetCount === 0
      ? 'UNAVAILABLE'
      : metrics.excludedSetCount === 0
        ? 'COMPLETE'
        : 'PARTIAL';
  return {
    status,
    includedSetCount: metrics.includedSetCount,
    excludedSetCount: metrics.excludedSetCount,
  };
}

function volumeValue(metrics: MutableMetrics): string | null {
  return metrics.includedSetCount === 0
    ? null
    : centsToDecimal(metrics.volumeCents);
}

function toWeeklySummary(bucket: WeeklyBucket): WeeklyTrainingSummary {
  return {
    weekStart: bucket.weekStart,
    weekEnd: bucket.weekEnd,
    completedWorkouts: bucket.completedWorkouts,
    trainingDays: bucket.trainingDays.size,
    completedWorkingSets: bucket.completedWorkingSets,
    warmupSets: bucket.warmupSets,
    totalRepetitions: bucket.totalRepetitions,
    volumeLoadKg: volumeValue(bucket),
    volumeCompleteness: volumeCompleteness(bucket),
  };
}

function toExerciseSummary(
  metrics: MutableExerciseMetrics,
): ExerciseFrequencySummary {
  return {
    exerciseId: metrics.exerciseId,
    exerciseSlug: metrics.exerciseSlug,
    exerciseNameSnapshot: metrics.exerciseNameSnapshot,
    completedWorkoutCount: metrics.completedWorkoutIds.size,
    completedWorkingSetCount: metrics.completedWorkingSets,
    totalRepetitions: metrics.totalRepetitions,
    maximumLoadKg:
      metrics.maximumLoadCents === null
        ? null
        : centsToDecimal(metrics.maximumLoadCents),
    lastWorkingSet: metrics.lastWorkingSet
      ? {
          repetitions: metrics.lastWorkingSet.repetitions,
          loadKg: centsToDecimal(parseLoadCents(metrics.lastWorkingSet.loadKg)),
          completedAt: metrics.lastWorkingSet.completedAt.toISOString(),
        }
      : null,
    volumeLoadKg: volumeValue(metrics),
    volumeCompleteness: volumeCompleteness(metrics),
  };
}

function toRecentWorkoutSummary(session: AnalyticsSourceSession) {
  const metrics = createMetrics();
  for (const performance of session.performances) {
    addPerformance(metrics, performance);
  }
  if (!session.completedAt) {
    throw new AnalyticsQueryError('Analytics data could not be loaded.');
  }
  return {
    workoutSessionId: session.id,
    displayName: session.sourceRoutineNameSnapshot ?? 'Freestyle workout',
    startedAt: session.startedAt.toISOString(),
    completedAt: session.completedAt.toISOString(),
    completedWorkingSetCount: metrics.completedWorkingSets,
    totalRepetitions: metrics.totalRepetitions,
    volumeLoadKg: volumeValue(metrics),
    volumeCompleteness: volumeCompleteness(metrics),
  };
}

function averageWorkouts(buckets: WeeklyBucket[]): number {
  if (buckets.length === 0) return 0;
  const total = buckets.reduce(
    (sum, bucket) => sum + bucket.completedWorkouts,
    0,
  );
  return Number((total / buckets.length).toFixed(2));
}

function parseLoadCents(value: string): bigint {
  const normalized = value.trim();
  const match = normalized.match(/^(-?)(\d+)(?:\.(\d{1,2}))?$/);
  if (!match) {
    throw new AnalyticsQueryError('Analytics data could not be loaded.');
  }
  const sign = match[1] === '-' ? -1n : 1n;
  const fraction = (match[3] ?? '').padEnd(2, '0');
  const result = sign * (BigInt(match[2]) * 100n + BigInt(fraction));
  if (result < 0n) {
    throw new AnalyticsQueryError('Analytics data could not be loaded.');
  }
  return result;
}

function validateSourceSession(session: AnalyticsSourceSession): void {
  if (
    typeof session.id !== 'string' ||
    !session.id.trim() ||
    !isValidDate(session.startedAt) ||
    !isValidDate(session.createdAt)
  ) {
    throw new AnalyticsQueryError('Analytics data could not be loaded.');
  }
  if (!isValidDate(session.completedAt) || session.cancelledAt !== null) {
    throw new AnalyticsQueryError('Analytics data could not be loaded.');
  }
  if (
    session.sourceRoutineNameSnapshot !== null &&
    (typeof session.sourceRoutineNameSnapshot !== 'string' ||
      session.sourceRoutineNameSnapshot !==
        session.sourceRoutineNameSnapshot.trim() ||
      session.sourceRoutineNameSnapshot.length < 2 ||
      session.sourceRoutineNameSnapshot.length > 150)
  ) {
    throw new AnalyticsQueryError('Analytics data could not be loaded.');
  }
  const hasCompletedSet = session.performances.some(
    ({ completedSets }) => completedSets.length > 0,
  );
  if (!hasCompletedSet) {
    throw new AnalyticsQueryError('Analytics data could not be loaded.');
  }
}

function validatePerformance(
  performance: AnalyticsSourcePerformance,
  namesByExerciseId: Map<string, string>,
): void {
  if (
    typeof performance.exerciseId !== 'string' ||
    !performance.exerciseId.trim() ||
    typeof performance.exerciseSlug !== 'string' ||
    !isCanonicalSlug(performance.exerciseSlug)
  ) {
    throw new AnalyticsQueryError('Analytics data could not be loaded.');
  }
  const name = performance.exerciseNameSnapshot;
  if (
    typeof name !== 'string' ||
    name !== name.trim() ||
    name.length < 2 ||
    name.length > 150
  ) {
    throw new AnalyticsQueryError('Analytics data could not be loaded.');
  }
  const previousName = namesByExerciseId.get(performance.exerciseId);
  if (previousName !== undefined && previousName !== name) {
    throw new AnalyticsQueryError('Analytics data could not be loaded.');
  }
  namesByExerciseId.set(performance.exerciseId, name);
  for (const set of performance.completedSets) validateSet(set);
}

function validateSet(set: AnalyticsSourceSet): void {
  if (
    typeof set.id !== 'string' ||
    !set.id.trim() ||
    !Number.isInteger(set.order) ||
    set.order < 0 ||
    !isValidDate(set.completedAt) ||
    typeof set.loadKg !== 'string'
  ) {
    throw new AnalyticsQueryError('Analytics data could not be loaded.');
  }
  validateRepetitions(set.repetitions);
  parseLoadCents(set.loadKg);
}

function isCanonicalSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function validateRepetitions(repetitions: number): void {
  if (!Number.isInteger(repetitions) || repetitions < 0 || repetitions > 1000) {
    throw new AnalyticsQueryError('Analytics data could not be loaded.');
  }
}

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function compareCodePoints(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function centsToDecimal(value: bigint): string {
  const sign = value < 0n ? '-' : '';
  const absolute = value < 0n ? -value : value;
  return `${sign}${absolute / 100n}.${(absolute % 100n)
    .toString()
    .padStart(2, '0')}`;
}

function validateTimezone(timezone: string): void {
  if (!timezone.trim()) {
    throw new AnalyticsValidationError('Analytics timezone is required.');
  }
  try {
    validateIanaTimezone(timezone);
  } catch {
    throw new AnalyticsValidationError('Analytics timezone is invalid.');
  }
}

function validateDate(value: Date, label: string): void {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new AnalyticsValidationError(`${label} is invalid.`);
  }
}
