import {
  calculateAnalyticsOverview,
  resolveAnalyticsOverviewQuery,
} from './analytics-overview.calculator';
import {
  AnalyticsQueryError,
  AnalyticsValidationError,
} from '../errors/analytics.errors';
import type {
  AnalyticsOverviewQuery,
  AnalyticsSourceSession,
} from '../models/analytics-overview.model';

const ownerId = '223e4567-e89b-12d3-a456-426614174000';
const exerciseA = '323e4567-e89b-12d3-a456-426614174000';
const exerciseB = '423e4567-e89b-12d3-a456-426614174000';

function query(
  from: string,
  to: string,
  timezone = 'UTC',
): Parameters<typeof calculateAnalyticsOverview>[0] {
  return {
    ownerId,
    timezone,
    from: new Date(from),
    to: new Date(to),
    includesPartialCurrentWeek: false,
  };
}

function session(
  id: string,
  startedAt: string,
  performances: AnalyticsSourceSession['performances'],
  sourceRoutineNameSnapshot: string | null = null,
): AnalyticsSourceSession {
  return {
    id,
    sourceRoutineNameSnapshot,
    startedAt: new Date(startedAt),
    createdAt: new Date(startedAt),
    completedAt: new Date(startedAt),
    cancelledAt: null,
    performances,
  };
}

function performance(
  exerciseId: string,
  exerciseNameSnapshot: string,
  completedSets: AnalyticsSourceSession['performances'][number]['completedSets'],
) {
  return {
    exerciseId,
    exerciseSlug: exerciseNameSnapshot.toLowerCase().replaceAll(' ', '-'),
    exerciseNameSnapshot,
    completedSets,
  };
}

function set(
  repetitions: number,
  loadKg: string,
  isWarmup = false,
  completedAt = '2026-01-06T12:30:00.000Z',
  order = 0,
): AnalyticsSourceSession['performances'][number]['completedSets'][number] {
  return {
    id: `set-${order}-${repetitions}-${loadKg}`,
    order,
    repetitions,
    loadKg,
    isWarmup,
    completedAt: new Date(completedAt),
  };
}

describe('analytics overview calculator', () => {
  it('rejects equal and reversed date ranges', () => {
    // Failure modes: BC-01
    // Arrange
    const equal: AnalyticsOverviewQuery = {
      ownerId,
      timezone: 'UTC',
      from: new Date('2026-01-01T00:00:00.000Z'),
      to: new Date('2026-01-01T00:00:00.000Z'),
    };
    const reversed: AnalyticsOverviewQuery = {
      ...equal,
      from: new Date('2026-01-02T00:00:00.000Z'),
      to: new Date('2026-01-01T00:00:00.000Z'),
    };

    // Act
    const equalCall = () => resolveAnalyticsOverviewQuery(equal);
    const reversedCall = () => resolveAnalyticsOverviewQuery(reversed);

    // Assert
    expect(equalCall).toThrow(AnalyticsValidationError);
    expect(reversedCall).toThrow(AnalyticsValidationError);
  });

  it('requires both custom range boundaries or neither', () => {
    // Failure mode: NE-02
    // Arrange
    const base: AnalyticsOverviewQuery = { ownerId, timezone: 'UTC' };
    const onlyFrom = {
      ...base,
      from: new Date('2026-01-01T00:00:00.000Z'),
    };
    const onlyTo = {
      ...base,
      to: new Date('2026-01-08T00:00:00.000Z'),
    };

    // Act
    const onlyFromCall = () => resolveAnalyticsOverviewQuery(onlyFrom);
    const onlyToCall = () => resolveAnalyticsOverviewQuery(onlyTo);

    // Assert
    expect(onlyFromCall).toThrow(AnalyticsValidationError);
    expect(onlyToCall).toThrow(AnalyticsValidationError);
  });

  it('rejects a missing, blank, or invalid timezone', () => {
    // Failure mode: NE-01
    // Arrange
    const base = { ownerId, from: new Date('2026-01-01T00:00:00.000Z') };

    // Act
    const missing = () =>
      resolveAnalyticsOverviewQuery({ ...base, timezone: '' }, new Date());
    const blank = () =>
      resolveAnalyticsOverviewQuery({ ...base, timezone: '   ' }, new Date());
    const invalid = () =>
      resolveAnalyticsOverviewQuery(
        { ...base, timezone: 'Not/A_Timezone' },
        new Date(),
      );

    // Assert
    expect(missing).toThrow(AnalyticsValidationError);
    expect(blank).toThrow(AnalyticsValidationError);
    expect(invalid).toThrow(AnalyticsValidationError);
  });

  it('accepts a maximum 52-local-week range and rejects a longer range', () => {
    // Failure mode: BC-04
    // Arrange
    const maximum: AnalyticsOverviewQuery = {
      ownerId,
      timezone: 'Africa/Cairo',
      from: new Date('2010-05-02T21:00:00.000Z'),
      to: new Date('2011-05-01T22:00:00.000Z'),
    };
    const tooLong = {
      ...maximum,
      to: new Date('2011-05-02T22:00:00.000Z'),
    };

    // Act
    const resolved = () => resolveAnalyticsOverviewQuery(maximum);
    const rejected = () => resolveAnalyticsOverviewQuery(tooLong);

    // Assert
    expect(resolved).not.toThrow();
    expect(rejected).toThrow(AnalyticsValidationError);
  });

  it('clamps a current client timestamp that is only slightly ahead of the API clock', () => {
    const now = new Date('2026-09-07T20:49:38.000Z');
    const resolved = resolveAnalyticsOverviewQuery(
      {
        ownerId,
        timezone: 'UTC',
        from: new Date('2026-08-17T00:00:00.000Z'),
        to: new Date('2026-09-07T20:49:38.660Z'),
      },
      now,
    );

    expect(resolved.to).toEqual(now);
  });

  it('keeps the current week in the default series at Monday midnight', () => {
    // Failure mode: BC-03
    // Arrange
    const now = new Date('2026-09-06T21:00:00.000Z');
    const resolved = resolveAnalyticsOverviewQuery(
      { ownerId, timezone: 'Asia/Qatar' },
      now,
    );

    // Act
    const overview = calculateAnalyticsOverview(resolved, []);

    // Assert
    expect(overview.weekly).toHaveLength(8);
    expect(overview.weekly.at(-1)?.weekStart).toBe('2026-09-07');
  });

  it('keeps local training days and weeks stable across DST', () => {
    // Failure mode: BC-06
    // Arrange
    const sessions = [
      session('session-before-dst', '2025-03-09T06:59:00.000Z', [
        performance(exerciseA, 'Bench Press', [set(1, '0.00', true)]),
      ]),
      session('session-after-dst', '2025-03-09T07:01:00.000Z', [
        performance(exerciseA, 'Bench Press', [set(1, '0.00', true)]),
      ]),
    ];

    // Act
    const overview = calculateAnalyticsOverview(
      query(
        '2025-03-03T05:00:00.000Z',
        '2025-03-17T04:00:00.000Z',
        'America/New_York',
      ),
      sessions,
    );

    // Assert
    expect(overview.totals.completedWorkouts).toBe(2);
    expect(overview.totals.trainingDays).toBe(1);
    expect(
      overview.weekly.reduce((sum, week) => sum + week.completedWorkouts, 0),
    ).toBe(2);
  });

  it('excludes the current and future weeks from complete-week statistics', () => {
    // Failure mode: BV-02
    // Arrange
    const resolved = {
      ...query('2026-08-31T00:00:00.000Z', '2026-09-21T00:00:00.000Z'),
      includesPartialCurrentWeek: true,
    };
    const sessions = [
      session('historical', '2026-08-31T12:00:00.000Z', [
        performance(exerciseA, 'Bench Press', [set(1, '0.00', true)]),
      ]),
      session('current', '2026-09-07T12:00:00.000Z', [
        performance(exerciseA, 'Bench Press', [set(1, '0.00', true)]),
      ]),
    ];

    // Act
    const overview = calculateAnalyticsOverview(resolved, sessions);

    // Assert
    expect(overview.totals.completeWeeks).toBe(1);
    expect(overview.totals.averageWorkoutsPerCompleteWeek).toBe(1);
  });

  it('counts partial weeks with activity as active weeks', () => {
    // Failure mode: EC-10
    // Arrange
    const resolved = {
      ...query('2026-01-07T00:00:00.000Z', '2026-01-14T00:00:00.000Z'),
      includesPartialCurrentWeek: false,
      now: new Date('2026-01-14T00:00:00.000Z'),
    };
    const sessions = [
      session('partial-week-activity', '2026-01-07T12:00:00.000Z', [
        performance(exerciseA, 'Bench Press', [set(1, '0.00', true)]),
      ]),
    ];

    // Act
    const overview = calculateAnalyticsOverview(resolved, sessions);

    // Assert
    expect(overview.totals.activeWeeks).toBe(1);
  });

  it('rounds average workouts per complete week half-up to two decimals', () => {
    // Failure mode: BV-03
    // Arrange
    const sessions = [
      session('one-workout', '2026-01-05T12:00:00.000Z', [
        performance(exerciseA, 'Bench Press', [set(1, '0.00', true)]),
      ]),
    ];

    // Act
    const overview = calculateAnalyticsOverview(
      query('2026-01-05T00:00:00.000Z', '2026-03-02T00:00:00.000Z'),
      sessions,
    );

    // Assert
    expect(overview.totals.averageWorkoutsPerCompleteWeek).toBe(0.13);
  });

  it('counts warm-ups separately and excludes them from working totals', () => {
    // Failure modes: EC-02, NE-04
    // Arrange
    const sessions = [
      session('warmup-only', '2026-01-06T12:00:00.000Z', [
        performance(exerciseA, 'Bench Press', [set(10, '50.00', true)]),
      ]),
    ];

    // Act
    const overview = calculateAnalyticsOverview(
      query('2026-01-05T00:00:00.000Z', '2026-01-12T00:00:00.000Z'),
      sessions,
    );

    // Assert
    expect(overview.totals.completedWorkouts).toBe(1);
    expect(overview.totals.warmupSets).toBe(1);
    expect(overview.totals.completedWorkingSets).toBe(0);
    expect(overview.totals.totalRepetitions).toBe(0);
    expect(overview.totals.volumeLoadKg).toBeNull();
    expect(overview.volumeCompleteness.status).toBe('UNAVAILABLE');
    expect(overview.exercises).toEqual([
      expect.objectContaining({
        exerciseId: exerciseA,
        completedWorkoutCount: 1,
        completedWorkingSetCount: 0,
      }),
    ]);
  });

  it('excludes zero-load and zero-repetition sets from volume but keeps working counts', () => {
    // Failure modes: EC-03, BC-05
    // Arrange
    const sessions = [
      session('mixed-volume', '2026-01-06T12:00:00.000Z', [
        performance(exerciseA, 'Bench Press', [
          set(10, '100.25'),
          set(10, '0.00'),
          set(0, '80.00'),
        ]),
      ]),
    ];

    // Act
    const overview = calculateAnalyticsOverview(
      query('2026-01-05T00:00:00.000Z', '2026-01-12T00:00:00.000Z'),
      sessions,
    );

    // Assert
    expect(overview.totals.completedWorkingSets).toBe(3);
    expect(overview.totals.totalRepetitions).toBe(20);
    expect(overview.totals.volumeLoadKg).toBe('1002.50');
    expect(overview.volumeCompleteness).toEqual({
      status: 'PARTIAL',
      includedSetCount: 1,
      excludedSetCount: 2,
    });
  });

  it('reports volume as unavailable when every working set has zero load', () => {
    // Failure mode: EC-03
    // Arrange
    const sessions = [
      session('zero-volume', '2026-01-06T12:00:00.000Z', [
        performance(exerciseA, 'Bench Press', [set(10, '0.00')]),
      ]),
    ];

    // Act
    const overview = calculateAnalyticsOverview(
      query('2026-01-05T00:00:00.000Z', '2026-01-12T00:00:00.000Z'),
      sessions,
    );

    // Assert
    expect(overview.totals.completedWorkingSets).toBe(1);
    expect(overview.totals.totalRepetitions).toBe(10);
    expect(overview.totals.volumeLoadKg).toBeNull();
    expect(overview.volumeCompleteness).toEqual({
      status: 'UNAVAILABLE',
      includedSetCount: 0,
      excludedSetCount: 1,
    });
  });

  it('returns an unavailable volume state for an empty completed history', () => {
    // Failure mode: NE-03
    // Arrange
    const resolved = query(
      '2026-01-05T00:00:00.000Z',
      '2026-01-12T00:00:00.000Z',
    );

    // Act
    const overview = calculateAnalyticsOverview(resolved, []);

    // Assert
    expect(overview.totals.completedWorkouts).toBe(0);
    expect(overview.exercises).toEqual([]);
    expect(overview.totals.volumeLoadKg).toBeNull();
    expect(overview.volumeCompleteness).toEqual({
      status: 'UNAVAILABLE',
      includedSetCount: 0,
      excludedSetCount: 0,
    });
  });

  it('groups repeated exercise performances by stable ID and counts the workout once', () => {
    // Failure modes: EC-04, EC-05
    // Arrange
    const sessions = [
      session('same-day-workout-1', '2026-01-06T08:00:00.000Z', [
        performance(exerciseA, 'Bench Press', [set(5, '100.00')]),
      ]),
      session('same-day-workout-2', '2026-01-06T18:00:00.000Z', [
        performance(exerciseA, 'Bench Press', [set(5, '100.00')]),
        performance(exerciseA, 'Bench Press', [set(5, '100.00')]),
      ]),
    ];

    // Act
    const overview = calculateAnalyticsOverview(
      query('2026-01-05T00:00:00.000Z', '2026-01-12T00:00:00.000Z'),
      sessions,
    );

    // Assert
    expect(overview.totals.completedWorkouts).toBe(2);
    expect(overview.totals.trainingDays).toBe(1);
    expect(overview.exercises).toHaveLength(1);
    expect(overview.exercises[0]).toMatchObject({
      exerciseId: exerciseA,
      completedWorkoutCount: 2,
      completedWorkingSetCount: 3,
      totalRepetitions: 15,
    });
  });

  it('uses the most recent exercise snapshot across workouts', () => {
    // Failure mode: EC-06
    // Arrange
    const sessions = [
      session('older-session', '2026-01-06T12:00:00.000Z', [
        performance(exerciseA, 'Old Name', [set(5, '100.00')]),
      ]),
      session('newer-session', '2026-01-07T12:00:00.000Z', [
        performance(exerciseA, 'New Name', [set(5, '100.00')]),
      ]),
    ];

    // Act
    const overview = calculateAnalyticsOverview(
      query('2026-01-05T00:00:00.000Z', '2026-01-12T00:00:00.000Z'),
      sessions,
    );

    // Assert
    expect(overview.exercises[0]?.exerciseNameSnapshot).toBe('New Name');
  });

  it('uses the latest-created snapshot when startedAt timestamps are equal', () => {
    // Failure mode: EC-07
    // Arrange
    const sessions = [
      {
        ...session(
          'ffffffff-ffff-4fff-8fff-ffffffffffff',
          '2026-01-06T12:00:00.000Z',
          [performance(exerciseA, 'Older Snapshot', [set(5, '100.00')])],
        ),
        createdAt: new Date('2026-01-06T12:00:00.000Z'),
      },
      {
        ...session(
          '00000000-0000-4000-8000-000000000000',
          '2026-01-06T12:00:00.000Z',
          [performance(exerciseA, 'Newer Snapshot', [set(5, '100.00')])],
        ),
        createdAt: new Date('2026-01-06T13:00:00.000Z'),
      },
    ];

    // Act
    const overview = calculateAnalyticsOverview(
      query('2026-01-05T00:00:00.000Z', '2026-01-12T00:00:00.000Z'),
      sessions,
    );

    // Assert
    expect(overview.exercises[0]?.exerciseNameSnapshot).toBe('Newer Snapshot');
  });

  it('omits exercise-frequency entries with no completed sets', () => {
    // Failure mode: NE-05
    // Arrange
    const sessions = [
      session('empty-performance', '2026-01-06T12:00:00.000Z', [
        performance(exerciseB, 'Planned Exercise', []),
        performance(exerciseA, 'Bench Press', [set(1, '0.00', true)]),
      ]),
    ];

    // Act
    const overview = calculateAnalyticsOverview(
      query('2026-01-05T00:00:00.000Z', '2026-01-12T00:00:00.000Z'),
      sessions,
    );

    // Assert
    expect(overview.exercises.map(({ exerciseId }) => exerciseId)).toEqual([
      exerciseA,
    ]);
  });

  it('assigns a session to its startedAt local day rather than its completion day', () => {
    // Failure mode: EC-09
    // Arrange
    const sessionWithCompletion = {
      ...session('overnight-session', '2026-01-06T23:30:00.000Z', [
        performance(exerciseA, 'Bench Press', [set(5, '100.00')]),
      ]),
      completedAt: new Date('2026-01-07T01:30:00.000Z'),
    };

    // Act
    const overview = calculateAnalyticsOverview(
      query('2026-01-06T00:00:00.000Z', '2026-01-08T00:00:00.000Z'),
      [sessionWithCompletion],
    );

    // Assert
    expect(overview.totals.trainingDays).toBe(1);
    expect(overview.weekly[0]?.trainingDays).toBe(1);
  });

  it('fails with a query error for malformed persisted load data', () => {
    // Failure mode: BV-05
    // Arrange
    const sessions = [
      session('malformed-load', '2026-01-06T12:00:00.000Z', [
        performance(exerciseA, 'Bench Press', [set(5, 'not-a-decimal')]),
      ]),
    ];

    // Act
    const action = () =>
      calculateAnalyticsOverview(
        query('2026-01-05T00:00:00.000Z', '2026-01-12T00:00:00.000Z'),
        sessions,
      );

    // Assert
    expect(action).toThrow(AnalyticsQueryError);
  });

  it('orders exercise summaries by display name and then exercise ID', () => {
    // Failure mode: BV-09
    // Arrange
    const sessions = [
      session('ordered-exercises', '2026-01-06T12:00:00.000Z', [
        performance(exerciseA, 'Zeta', [set(1, '1.00')]),
        performance(exerciseB, 'Alpha', [set(1, '1.00')]),
      ]),
    ];

    // Act
    const overview = calculateAnalyticsOverview(
      query('2026-01-05T00:00:00.000Z', '2026-01-12T00:00:00.000Z'),
      sessions,
    );

    // Assert
    expect(
      overview.exercises.map(
        ({ exerciseNameSnapshot }) => exerciseNameSnapshot,
      ),
    ).toEqual(['Alpha', 'Zeta']);
  });

  it('uses exercise ID as the deterministic ordering tie-breaker', () => {
    // Failure mode: BV-09
    // Arrange
    const sessions = [
      session('same-name-exercises', '2026-01-06T12:00:00.000Z', [
        performance(exerciseB, 'Same Name', [set(1, '1.00')]),
        performance(exerciseA, 'Same Name', [set(1, '1.00')]),
      ]),
    ];

    // Act
    const overview = calculateAnalyticsOverview(
      query('2026-01-05T00:00:00.000Z', '2026-01-12T00:00:00.000Z'),
      sessions,
    );

    // Assert
    expect(overview.exercises.map(({ exerciseId }) => exerciseId)).toEqual([
      exerciseA,
      exerciseB,
    ]);
  });

  it('ranks exercises by working sets and reports maximum and latest working-set performance', () => {
    const sessions = [
      session(
        'older-session',
        '2026-01-06T10:00:00.000Z',
        [
          performance(exerciseA, 'Bench Press', [
            set(8, '80.00', true, '2026-01-06T10:10:00.000Z', 0),
            set(5, '120.00', false, '2026-01-06T10:20:00.000Z', 1),
            set(8, '100.00', false, '2026-01-06T10:30:00.000Z', 2),
          ]),
          performance(exerciseB, 'Cable Fly', [
            set(12, '25.00', false, '2026-01-06T10:40:00.000Z', 0),
          ]),
        ],
        'Push day',
      ),
      session('newer-session', '2026-01-07T10:00:00.000Z', [
        performance(exerciseA, 'Bench Press', [
          set(10, '95.00', false, '2026-01-07T10:20:00.000Z', 0),
        ]),
      ]),
    ];

    const overview = calculateAnalyticsOverview(
      query('2026-01-05T00:00:00.000Z', '2026-01-12T00:00:00.000Z'),
      sessions,
    );

    expect(overview.exercises.map(({ exerciseNameSnapshot }) => exerciseNameSnapshot)).toEqual([
      'Bench Press',
      'Cable Fly',
    ]);
    expect(overview.exercises[0]).toMatchObject({
      maximumLoadKg: '120.00',
      lastWorkingSet: {
        repetitions: 10,
        loadKg: '95.00',
        completedAt: '2026-01-07T10:20:00.000Z',
      },
    });
    expect(overview.recentWorkouts[0]).toMatchObject({
      workoutSessionId: 'newer-session',
      displayName: 'Freestyle workout',
      completedWorkingSetCount: 1,
      totalRepetitions: 10,
    });
    expect(overview.recentWorkouts[1]?.displayName).toBe('Push day');
  });

  it('keeps zero-load working sets as performance while marking volume unavailable', () => {
    const overview = calculateAnalyticsOverview(
      query('2026-01-05T00:00:00.000Z', '2026-01-12T00:00:00.000Z'),
      [
        session('bodyweight', '2026-01-06T12:00:00.000Z', [
          performance(exerciseA, 'Pull Up', [set(10, '0.00')]),
        ]),
      ],
    );

    expect(overview.exercises[0]).toMatchObject({
      maximumLoadKg: '0.00',
      lastWorkingSet: { repetitions: 10, loadKg: '0.00' },
      volumeLoadKg: null,
    });
  });
});
