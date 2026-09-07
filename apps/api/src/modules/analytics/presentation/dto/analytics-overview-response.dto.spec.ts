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
    const overview = schemas?.AnalyticsOverviewResponseDto;
    if (
      !period ||
      '$ref' in period ||
      !totals ||
      '$ref' in totals ||
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
