import { Test } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AnalyticsController } from '../analytics.controller';
import { GetAnalyticsOverviewUseCase } from '../../application/use-cases/get-analytics-overview.use-case';

describe('AnalyticsOverviewResponseDto', () => {
  it('documents explicit period and totals response schemas', async () => {
    // Failure mode: BV-04
    const moduleRef = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: GetAnalyticsOverviewUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();
    const app = moduleRef.createNestApplication();
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().build(),
    );

    const schemas = document.components?.schemas;
    const period = schemas?.AnalyticsPeriodResponseDto;
    const totals = schemas?.AnalyticsTotalsResponseDto;
    const weekly = schemas?.WeeklyTrainingSummaryResponseDto;
    const exercise = schemas?.ExerciseFrequencySummaryResponseDto;
    const recentWorkout = schemas?.RecentWorkoutSummaryResponseDto;
    const comparison = schemas?.AnalyticsComparisonResponseDto;
    const overview = schemas?.AnalyticsOverviewResponseDto;
    if (
      !period ||
      '$ref' in period ||
      !totals ||
      '$ref' in totals ||
      !weekly ||
      '$ref' in weekly ||
      !exercise ||
      '$ref' in exercise ||
      !recentWorkout ||
      '$ref' in recentWorkout ||
      !comparison ||
      '$ref' in comparison ||
      !overview ||
      '$ref' in overview
    ) {
      throw new Error('Expected inline analytics response schemas.');
    }

    expect(period.type).toBe('object');
    expect(period.required).toEqual([
      'from',
      'to',
      'timezone',
      'includesPartialCurrentWeek',
    ]);
    expect(totals.type).toBe('object');
    expect(totals.required).toContain('activeWeeks');
    expect(totals.required).toContain('completeWeeks');
    expect(totals.required).toContain('averageWorkoutsPerCompleteWeek');
    expect(totals.required).toContain('volumeLoadKg');
    expect(weekly.required).toContain('volumeLoadKg');
    expect(exercise.required).toContain('exerciseSlug');
    expect(exercise.required).toContain('volumeLoadKg');
    expect(exercise.required).toContain('maximumLoadKg');
    expect(exercise.required).toContain('lastWorkingSet');
    expect(exercise.properties?.maximumLoadKg).toMatchObject({ nullable: true });
    expect(exercise.properties?.lastWorkingSet).toMatchObject({ nullable: true });
    expect(recentWorkout.required).toEqual(
      expect.arrayContaining([
        'workoutSessionId',
        'displayName',
        'completedWorkingSetCount',
        'totalRepetitions',
        'volumeLoadKg',
      ]),
    );
    expect(comparison.required).toEqual(
      expect.arrayContaining(['period', 'totals', 'volumeCompleteness']),
    );
    expect(overview.required).toEqual(
      expect.arrayContaining(['comparison', 'recentWorkouts']),
    );
    expect(weekly.properties?.volumeLoadKg).toMatchObject({ nullable: true });
    expect(exercise.properties?.volumeLoadKg).toMatchObject({ nullable: true });
    expect(totals.properties?.volumeLoadKg).toMatchObject({ nullable: true });

    const overviewPath = Object.values(document.paths ?? {}).find((path) => path?.get);
    expect(overviewPath?.get?.responses?.['401']).toMatchObject({
      description: 'Authentication is required',
    });

    const periodReference = overview.properties?.period;
    const totalsReference = overview.properties?.totals;
    if (
      !periodReference ||
      !('$ref' in periodReference) ||
      !totalsReference ||
      !('$ref' in totalsReference)
    ) {
      throw new Error('Expected analytics nested schema references.');
    }
    expect(periodReference.$ref).toContain('AnalyticsPeriodResponseDto');
    expect(totalsReference.$ref).toContain('AnalyticsTotalsResponseDto');

    await app.close();
  });
});
