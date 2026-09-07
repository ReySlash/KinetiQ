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
const exerciseId = '323e4567-e89b-12d3-a456-426614174000';
const secondExerciseId = '423e4567-e89b-12d3-a456-426614174000';

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
): AnalyticsSourceSession {
  return {
    id,
    startedAt: new Date(startedAt),
    createdAt: new Date(startedAt),
    completedAt: new Date(startedAt),
    cancelledAt: null,
    performances,
  };
}

function performance(
  exerciseNameSnapshot: string,
  completedSets: AnalyticsSourceSession['performances'][number]['completedSets'],
) {
  return { exerciseId, exerciseNameSnapshot, completedSets };
}

function set(
  repetitions: number,
  loadKg: string,
  isWarmup = false,
): AnalyticsSourceSession['performances'][number]['completedSets'][number] {
  return { repetitions, loadKg, isWarmup };
}

describe('analytics overview calculator additional contracts', () => {
  it('orders sessions before selecting the latest exercise snapshot', () => {
    // Failure modes: #6, #14
    // Arrange
    const sessions = [
      {
        ...session('newer', '2026-01-07T12:00:00.000Z', [
          performance('New Name', [set(5, '100.00')]),
        ]),
        createdAt: new Date('2026-01-07T12:00:00.000Z'),
      },
      {
        ...session('older', '2026-01-06T12:00:00.000Z', [
          performance('Old Name', [set(5, '100.00')]),
        ]),
        createdAt: new Date('2026-01-06T12:00:00.000Z'),
      },
    ];

    // Act
    const overview = calculateAnalyticsOverview(
      query('2026-01-05T00:00:00.000Z', '2026-01-12T00:00:00.000Z'),
      sessions,
    );

    // Assert
    expect(overview.exercises[0]?.exerciseNameSnapshot).toBe('New Name');
  });

  it('uses created-at order when started-at timestamps are equal', () => {
    // Failure mode: #15
    // Arrange
    const sessions = [
      {
        ...session('newer-created', '2026-01-06T12:00:00.000Z', [
          performance('Newer Snapshot', [set(5, '100.00')]),
        ]),
        createdAt: new Date('2026-01-06T13:00:00.000Z'),
      },
      {
        ...session('older-created', '2026-01-06T12:00:00.000Z', [
          performance('Older Snapshot', [set(5, '100.00')]),
        ]),
        createdAt: new Date('2026-01-06T12:00:00.000Z'),
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

  it('allows a 52-week duration to represent both partial endpoint weeks', () => {
    // Failure mode: BC-07
    // Arrange
    const resolved = resolveAnalyticsOverviewQuery(
      {
        ownerId,
        timezone: 'UTC',
        from: new Date('2026-01-07T12:00:00.000Z'),
        to: new Date('2027-01-06T12:00:00.000Z'),
      },
      new Date('2027-01-07T00:00:00.000Z'),
    );

    // Act
    const overview = calculateAnalyticsOverview(resolved, []);

    // Assert
    expect(overview.weekly).toHaveLength(53);
  });

  it('rejects a range whose endpoint exceeds 364 local calendar days at the same wall-clock time', () => {
    // Failure mode: BC-08
    // Arrange
    const input: AnalyticsOverviewQuery = {
      ownerId,
      timezone: 'UTC',
      from: new Date('2026-01-07T12:00:00.000Z'),
      to: new Date('2027-01-06T12:01:00.000Z'),
    };

    // Act
    const action = () => resolveAnalyticsOverviewQuery(input);

    // Assert
    expect(action).toThrow(AnalyticsValidationError);
  });

  it('rejects a range that exceeds 364 local calendar days by one millisecond', () => {
    // Failure mode: BC-08
    // Arrange
    const input: AnalyticsOverviewQuery = {
      ownerId,
      timezone: 'UTC',
      from: new Date('2026-01-07T12:00:00.000Z'),
      to: new Date('2027-01-06T12:00:00.001Z'),
    };

    // Act
    const action = () =>
      resolveAnalyticsOverviewQuery(
        input,
        new Date('2027-01-07T00:00:00.000Z'),
      );

    // Assert
    expect(action).toThrow(AnalyticsValidationError);
  });

  it('rejects custom ranges ending after now', () => {
    // Failure mode: BC-09
    // Arrange
    const input: AnalyticsOverviewQuery = {
      ownerId,
      timezone: 'UTC',
      from: new Date('2026-01-01T00:00:00.000Z'),
      to: new Date('2026-01-08T00:00:00.000Z'),
    };

    // Act
    const action = () =>
      resolveAnalyticsOverviewQuery(
        input,
        new Date('2026-01-07T00:00:00.000Z'),
      );

    // Assert
    expect(action).toThrow(AnalyticsValidationError);
  });

  it('keeps equivalent timezone aliases behaviorally consistent while preserving the trimmed response value', () => {
    // Failure mode: EC-11
    // Arrange
    const base = {
      ownerId,
      from: new Date('2026-01-05T00:00:00.000Z'),
      to: new Date('2026-01-12T00:00:00.000Z'),
    };

    // Act
    const eastern = resolveAnalyticsOverviewQuery({
      ...base,
      timezone: 'America/New_York',
    });
    const alias = resolveAnalyticsOverviewQuery({
      ...base,
      timezone: 'US/Eastern',
    });
    const easternOverview = calculateAnalyticsOverview(eastern, []);
    const aliasOverview = calculateAnalyticsOverview(alias, []);

    // Assert
    expect(easternOverview.weekly).toEqual(aliasOverview.weekly);
    expect(easternOverview.period.timezone).toBe('America/New_York');
    expect(aliasOverview.period.timezone).toBe('US/Eastern');
  });

  it('orders exercise summaries by Unicode code-point order independent of runtime locale', () => {
    // Failure mode: EC-12
    // Arrange
    const sessions = [
      session('mixed-name-order', '2026-01-06T12:00:00.000Z', [
        {
          exerciseId,
          exerciseNameSnapshot: 'apple',
          completedSets: [set(1, '1.00')],
        },
        {
          exerciseId: secondExerciseId,
          exerciseNameSnapshot: 'Zebra',
          completedSets: [set(1, '1.00')],
        },
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
    ).toEqual(['Zebra', 'apple']);
  });

  it('rejects a completed source session without a valid creation timestamp', () => {
    // Failure mode: NE-08
    // Arrange
    const source = {
      ...session('missing-created-at', '2026-01-06T12:00:00.000Z', [
        performance('Bench Press', [set(5, '100.00')]),
      ]),
      createdAt: undefined,
    } as unknown as AnalyticsSourceSession;

    // Act
    const action = () =>
      calculateAnalyticsOverview(
        query('2026-01-05T00:00:00.000Z', '2026-01-12T00:00:00.000Z'),
        [source],
      );

    // Assert
    expect(action).toThrow(AnalyticsQueryError);
  });

  it('validates every creation timestamp before ordering source sessions', () => {
    // Failure mode: NE-08
    // Arrange
    const invalid = {
      ...session('invalid-created-at', '2026-01-07T12:00:00.000Z', [
        performance('Bench Press', [set(5, '100.00')]),
      ]),
      createdAt: undefined,
    } as unknown as AnalyticsSourceSession;
    const valid = session('valid-created-at', '2026-01-06T12:00:00.000Z', [
      performance('Bench Press', [set(5, '100.00')]),
    ]);

    // Act
    const action = () =>
      calculateAnalyticsOverview(
        query('2026-01-05T00:00:00.000Z', '2026-01-12T00:00:00.000Z'),
        [invalid, valid],
      );

    // Assert
    expect(action).toThrow(AnalyticsQueryError);
  });

  it('rejects a completed source session without completed sets', () => {
    // Failure mode: NE-09
    // Arrange
    const sessions = [
      session('completed-without-sets', '2026-01-06T12:00:00.000Z', [
        performance('Bench Press', []),
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

  it.each([-1, 1001, 1.5])(
    'rejects persisted repetitions outside the integer range: %s',
    (repetitions) => {
      // Failure mode: BV-11
      // Arrange
      const sessions = [
        session('invalid-repetitions', '2026-01-06T12:00:00.000Z', [
          performance('Bench Press', [set(repetitions, '100.00')]),
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
    },
  );

  it('accepts the maximum persisted repetition count', () => {
    // Failure mode: BV-11
    const overview = calculateAnalyticsOverview(
      query('2026-01-05T00:00:00.000Z', '2026-01-12T00:00:00.000Z'),
      [
        session('maximum-repetitions', '2026-01-06T12:00:00.000Z', [
          performance('Bench Press', [set(1000, '1.00')]),
        ]),
      ],
    );

    expect(overview.totals.totalRepetitions).toBe(1000);
  });

  it.each([' Bench Press ', 'A', 'x'.repeat(151)])(
    'rejects persisted exercise-name snapshots outside the domain format',
    (exerciseNameSnapshot) => {
      // Failure mode: BV-12
      // Arrange
      const sessions = [
        session('invalid-exercise-name', '2026-01-06T12:00:00.000Z', [
          performance(exerciseNameSnapshot, [set(5, '100.00')]),
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
    },
  );

  it.each(['AB', 'x'.repeat(150)])(
    'accepts exercise-name snapshots at the inclusive length boundary',
    (exerciseNameSnapshot) => {
      // Failure mode: BV-12
      const overview = calculateAnalyticsOverview(
        query('2026-01-05T00:00:00.000Z', '2026-01-12T00:00:00.000Z'),
        [
          session('valid-name-boundary', '2026-01-06T12:00:00.000Z', [
            performance(exerciseNameSnapshot, [set(1, '1.00')]),
          ]),
        ],
      );

      expect(overview.exercises[0]?.exerciseNameSnapshot).toBe(
        exerciseNameSnapshot,
      );
    },
  );

  it('rejects an invalid snapshot on a performance without completed sets', () => {
    // Failure mode: BV-12
    // Arrange
    const sessions = [
      session('invalid-empty-performance', '2026-01-06T12:00:00.000Z', [
        performance(' Invalid ', []),
        {
          exerciseId: secondExerciseId,
          exerciseNameSnapshot: 'Squat',
          completedSets: [set(5, '100.00')],
        },
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

  it('rejects conflicting snapshots when one repeated performance is empty', () => {
    // Failure modes: EC-05, BV-05
    // Arrange
    const sessions = [
      session('conflicting-empty-performance', '2026-01-06T12:00:00.000Z', [
        performance('Bench Press', []),
        performance('Chest Press', [set(5, '100.00')]),
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

  it('excludes a valid empty performance from exercise metrics', () => {
    // Failure mode: NE-05
    // Arrange
    const sessions = [
      session('valid-empty-performance', '2026-01-06T12:00:00.000Z', [
        performance('Bench Press', []),
        {
          exerciseId: secondExerciseId,
          exerciseNameSnapshot: 'Squat',
          completedSets: [set(5, '100.00')],
        },
      ]),
    ];

    // Act
    const overview = calculateAnalyticsOverview(
      query('2026-01-05T00:00:00.000Z', '2026-01-12T00:00:00.000Z'),
      sessions,
    );

    // Assert
    expect(overview.exercises).toHaveLength(1);
    expect(overview.exercises[0]?.exerciseId).toBe(secondExerciseId);
  });

  it('keeps weekly metrics consistent with period totals', () => {
    // Failure mode: #34
    // Arrange
    const sessions = [
      session('weekly-metrics', '2026-01-06T12:00:00.000Z', [
        performance('Bench Press', [
          set(5, '100.00'),
          set(10, '50.00', true),
          set(0, '80.00'),
        ]),
      ]),
    ];

    // Act
    const overview = calculateAnalyticsOverview(
      query('2026-01-05T00:00:00.000Z', '2026-01-12T00:00:00.000Z'),
      sessions,
    );
    const week = overview.weekly[0];

    // Assert
    expect(week).toMatchObject({
      completedWorkouts: overview.totals.completedWorkouts,
      trainingDays: overview.totals.trainingDays,
      completedWorkingSets: overview.totals.completedWorkingSets,
      warmupSets: overview.totals.warmupSets,
      totalRepetitions: overview.totals.totalRepetitions,
      volumeLoadKg: overview.totals.volumeLoadKg,
      volumeCompleteness: overview.volumeCompleteness,
    });
  });

  it('counts only weeks containing workouts as active weeks', () => {
    // Failure mode: #42
    // Arrange
    const sessions = [
      session('active-one', '2026-01-06T12:00:00.000Z', [
        performance('Bench Press', [set(1, '0.00', true)]),
      ]),
      session('active-two', '2026-01-20T12:00:00.000Z', [
        performance('Bench Press', [set(1, '0.00', true)]),
      ]),
    ];

    // Act
    const overview = calculateAnalyticsOverview(
      query('2026-01-05T00:00:00.000Z', '2026-01-25T23:59:59.999Z'),
      sessions,
    );

    // Assert
    expect(overview.totals.activeWeeks).toBe(2);
  });

  it('accepts a custom range ending exactly at now', () => {
    // Failure mode: BC-09
    const now = new Date('2026-01-08T00:00:00.000Z');
    const resolved = resolveAnalyticsOverviewQuery(
      {
        ownerId,
        timezone: 'UTC',
        from: new Date('2026-01-01T00:00:00.000Z'),
        to: now,
      },
      now,
    );

    expect(resolved.to).toEqual(now);
  });

  it('rejects blank and unsupported timezones as validation errors', () => {
    // Failure modes: #53, #245, #248, #249, #250, #253, #256, #257
    // Arrange
    const base = {
      ownerId,
      from: new Date('2026-01-01T00:00:00.000Z'),
      to: new Date('2026-01-08T00:00:00.000Z'),
    };

    // Act
    const blank = () =>
      resolveAnalyticsOverviewQuery({ ...base, timezone: '   ' });
    const invalid = () =>
      resolveAnalyticsOverviewQuery({ ...base, timezone: 'Not/A_Timezone' });

    // Assert
    expect(blank).toThrow(AnalyticsValidationError);
    expect(invalid).toThrow(AnalyticsValidationError);
  });

  it('marks a range ending at current-week start as including the current week', () => {
    // Failure mode: #97
    // Arrange
    const input: AnalyticsOverviewQuery = {
      ownerId,
      timezone: 'UTC',
      from: new Date('2026-01-05T00:00:00.000Z'),
      to: new Date('2026-01-12T00:00:00.000Z'),
    };

    // Act
    const resolved = resolveAnalyticsOverviewQuery(
      input,
      new Date('2026-01-12T12:00:00.000Z'),
    );

    // Assert
    expect(resolved.includesPartialCurrentWeek).toBe(true);
  });

  it('marks a range inside the current week as partial', () => {
    // Failure modes: #89, #95
    // Arrange
    const input: AnalyticsOverviewQuery = {
      ownerId,
      timezone: 'UTC',
      from: new Date('2026-01-05T00:00:00.000Z'),
      to: new Date('2026-01-14T00:00:00.000Z'),
    };

    // Act
    const resolved = resolveAnalyticsOverviewQuery(
      input,
      new Date('2026-01-14T12:00:00.000Z'),
    );

    // Assert
    expect(resolved.includesPartialCurrentWeek).toBe(true);
  });

  it('trims the resolved timezone', () => {
    // Failure mode: #103
    // Arrange
    const input: AnalyticsOverviewQuery = {
      ownerId,
      timezone: ' UTC ',
      from: new Date('2026-01-01T00:00:00.000Z'),
      to: new Date('2026-01-08T00:00:00.000Z'),
    };

    // Act
    const resolved = resolveAnalyticsOverviewQuery(input);

    // Assert
    expect(resolved.timezone).toBe('UTC');
  });

  it('does not count a partial first week as complete', () => {
    // Failure mode: #118
    // Arrange
    const resolved = {
      ...query('2026-01-07T00:00:00.000Z', '2026-01-19T00:00:00.000Z'),
      now: new Date('2026-01-19T00:00:00.000Z'),
    };

    // Act
    const overview = calculateAnalyticsOverview(resolved, []);

    // Assert
    expect(overview.totals.completeWeeks).toBe(1);
  });

  it('counts only fully elapsed weeks, including one ending exactly at now', () => {
    // Failure modes: #130, #131, #132, #133
    // Arrange
    const resolved = {
      ...query('2026-08-31T00:00:00.000Z', '2026-09-21T00:00:00.000Z'),
      now: new Date('2026-09-14T00:00:00.000Z'),
    };

    // Act
    const overview = calculateAnalyticsOverview(resolved, []);

    // Assert
    expect(overview.totals.completeWeeks).toBe(2);
  });

  it('returns zero average when no complete week exists', () => {
    // Failure mode: #197
    // Arrange
    const resolved = {
      ...query('2026-01-07T00:00:00.000Z', '2026-01-09T00:00:00.000Z'),
      now: new Date('2026-01-09T00:00:00.000Z'),
    };

    // Act
    const overview = calculateAnalyticsOverview(resolved, []);

    // Assert
    expect(overview.totals.averageWorkoutsPerCompleteWeek).toBe(0);
  });

  it('reports complete volume when every working set is eligible', () => {
    // Failure mode: #182
    // Arrange
    const sessions = [
      session('complete-volume', '2026-01-06T12:00:00.000Z', [
        performance('Bench Press', [set(5, '100.00')]),
      ]),
    ];

    // Act
    const overview = calculateAnalyticsOverview(
      query('2026-01-05T00:00:00.000Z', '2026-01-12T00:00:00.000Z'),
      sessions,
    );

    // Assert
    expect(overview.volumeCompleteness).toEqual({
      status: 'COMPLETE',
      includedSetCount: 1,
      excludedSetCount: 0,
    });
  });

  it.each(['garbage100.00', '100.00garbage'])(
    'rejects malformed load data: %s',
    (loadKg) => {
      // Failure modes: #204, #205
      // Arrange
      const sessions = [
        session('malformed-load', '2026-01-06T12:00:00.000Z', [
          performance('Bench Press', [set(5, loadKg)]),
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
    },
  );

  it('accepts integer load values from persisted decimal serialization', () => {
    // Failure mode: #209
    // Arrange
    const sessions = [
      session('integer-load', '2026-01-06T12:00:00.000Z', [
        performance('Bench Press', [set(5, '50')]),
      ]),
    ];

    // Act
    const overview = calculateAnalyticsOverview(
      query('2026-01-05T00:00:00.000Z', '2026-01-12T00:00:00.000Z'),
      sessions,
    );

    // Assert
    expect(overview.totals.volumeLoadKg).toBe('250.00');
  });

  it('rejects negative persisted load as malformed data', () => {
    // Failure mode: #219
    // Arrange
    const sessions = [
      session('negative-load', '2026-01-06T12:00:00.000Z', [
        performance('Bench Press', [set(5, '-10.00')]),
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

  it('preserves one-digit decimal load precision', () => {
    // Failure mode: #225
    // Arrange
    const sessions = [
      session('one-digit-fraction', '2026-01-06T12:00:00.000Z', [
        performance('Bench Press', [set(5, '1.5')]),
      ]),
    ];

    // Act
    const overview = calculateAnalyticsOverview(
      query('2026-01-05T00:00:00.000Z', '2026-01-12T00:00:00.000Z'),
      sessions,
    );

    // Assert
    expect(overview.totals.volumeLoadKg).toBe('7.50');
  });

  it('formats cent-level volume with two decimal places', () => {
    // Failure mode: #244
    // Arrange
    const sessions = [
      session('cent-level-load', '2026-01-06T12:00:00.000Z', [
        performance('Bench Press', [set(1, '0.01')]),
      ]),
    ];

    // Act
    const overview = calculateAnalyticsOverview(
      query('2026-01-05T00:00:00.000Z', '2026-01-12T00:00:00.000Z'),
      sessions,
    );

    // Assert
    expect(overview.totals.volumeLoadKg).toBe('0.01');
  });

  it.each([
    ['from', new Date('invalid'), new Date('2026-01-08T00:00:00.000Z')],
    ['to', new Date('2026-01-01T00:00:00.000Z'), new Date('invalid')],
  ])('rejects invalid custom %s dates', (_label, from, to) => {
    // Failure modes: #260, #262
    // Arrange
    const input: AnalyticsOverviewQuery = {
      ownerId,
      timezone: 'UTC',
      from,
      to,
    };

    // Act
    const action = () => resolveAnalyticsOverviewQuery(input);

    // Assert
    expect(action).toThrow(AnalyticsValidationError);
  });

  it('rejects an invalid current date', () => {
    // Failure modes: #260, #262
    // Arrange
    const input: AnalyticsOverviewQuery = { ownerId, timezone: 'UTC' };

    // Act
    const action = () =>
      resolveAnalyticsOverviewQuery(input, new Date('invalid'));

    // Assert
    expect(action).toThrow(AnalyticsValidationError);
  });

  it('assigns Sunday to the preceding Monday-based week', () => {
    // Failure mode: #274
    // Arrange
    const sessions = [
      session('sunday-session', '2026-01-11T12:00:00.000Z', [
        performance('Bench Press', [set(1, '0.00', true)]),
      ]),
    ];

    // Act
    const overview = calculateAnalyticsOverview(
      query('2026-01-05T00:00:00.000Z', '2026-01-12T00:00:00.000Z'),
      sessions,
    );

    // Assert
    expect(overview.weekly[0]?.weekStart).toBe('2026-01-05');
    expect(overview.weekly[0]?.completedWorkouts).toBe(1);
  });

  it('resolves non-UTC local midnight correctly on a fresh calculator module', () => {
    // Failure modes: #304, #309, #318, #319, #320, #323, #325, #327, #329
    // Arrange
    jest.isolateModules(() => {
      const calculator = jest.requireActual<
        typeof import('./analytics-overview.calculator')
      >('./analytics-overview.calculator');

      // Act
      const resolved = calculator.resolveAnalyticsOverviewQuery(
        { ownerId, timezone: 'Asia/Qatar' },
        new Date('2026-09-07T12:00:00.000Z'),
      );

      // Assert
      expect(resolved.from).toEqual(new Date('2026-07-19T21:00:00.000Z'));
    });
  });
});
