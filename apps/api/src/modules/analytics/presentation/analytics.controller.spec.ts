import type { AuthenticatedPrincipal } from '../../shared/infrastructure/auth/principal';
import { GetAnalyticsOverviewUseCase } from '../application/use-cases/get-analytics-overview.use-case';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsOverviewQueryDto } from './dto/analytics-overview-query.dto';

const principal: AuthenticatedPrincipal = {
  userId: '223e4567-e89b-12d3-a456-426614174000',
  role: 'USER',
  sessionId: '323e4567-e89b-12d3-a456-426614174000',
};

describe('AnalyticsController', () => {
  it('derives the analytics owner from the authenticated principal', async () => {
    // Failure mode: BV-01
    // Arrange
    const execute = jest.fn().mockResolvedValue({ totals: {} });
    const controller = new AnalyticsController({
      execute,
    } as GetAnalyticsOverviewUseCase);
    const query = new AnalyticsOverviewQueryDto();
    query.timezone = 'UTC';

    // Act
    await controller.overview(principal, query);

    // Assert
    expect(execute).toHaveBeenCalledWith({
      ownerId: principal.userId,
      timezone: 'UTC',
      from: undefined,
      to: undefined,
    });
  });
});
