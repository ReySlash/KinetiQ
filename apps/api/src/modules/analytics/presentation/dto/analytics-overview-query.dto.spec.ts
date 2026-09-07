import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AnalyticsOverviewQueryDto } from './analytics-overview-query.dto';

describe('AnalyticsOverviewQueryDto', () => {
  it('requires a non-empty timezone', async () => {
    // Failure mode: NE-01
    // Arrange
    const missing = plainToInstance(AnalyticsOverviewQueryDto, {});
    const blank = plainToInstance(AnalyticsOverviewQueryDto, {
      timezone: '',
    });

    // Act
    const [missingErrors, blankErrors] = await Promise.all([
      validate(missing),
      validate(blank),
    ]);

    // Assert
    expect(missingErrors).not.toHaveLength(0);
    expect(blankErrors).not.toHaveLength(0);
  });

  it('validates RFC3339 date boundaries with explicit offsets', async () => {
    // Failure mode: BC-02
    // Arrange
    const dto = plainToInstance(AnalyticsOverviewQueryDto, {
      timezone: 'UTC',
      from: '2026-01-01T00:00:00.000Z',
      to: '2026-01-08T00:00:00.000Z',
    });

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(0);
    expect(dto.from).toBe('2026-01-01T00:00:00.000Z');
    expect(dto.to).toBe('2026-01-08T00:00:00.000Z');
  });

  it.each(['2026-01-01', '2026-01-01T12:00:00'])(
    'rejects custom date boundaries without an explicit UTC offset: %s',
    async (date) => {
      // Failure mode: EC-13
      // Arrange
      const dto = plainToInstance(AnalyticsOverviewQueryDto, {
        timezone: 'UTC',
        from: date,
        to: '2026-01-08T00:00:00.000Z',
      });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.some(({ property }) => property === 'from')).toBe(true);
    },
  );
});
