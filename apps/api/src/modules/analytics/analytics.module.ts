import { Module } from '@nestjs/common';
import { SharedDatabaseModule } from '../shared/infrastructure/database/shared-database.module';
import { AnalyticsQueryPort } from './application/ports/analytics-query.port';
import { GetAnalyticsOverviewUseCase } from './application/use-cases/get-analytics-overview.use-case';
import { PrismaAnalyticsAdapter } from './infrastructure/prisma/prisma-analytics.adapter';
import { AnalyticsController } from './presentation/analytics.controller';

@Module({
  imports: [SharedDatabaseModule],
  controllers: [AnalyticsController],
  providers: [
    PrismaAnalyticsAdapter,
    {
      provide: AnalyticsQueryPort,
      useExisting: PrismaAnalyticsAdapter,
    },
    {
      provide: GetAnalyticsOverviewUseCase,
      inject: [AnalyticsQueryPort],
      useFactory: (analytics: AnalyticsQueryPort) =>
        new GetAnalyticsOverviewUseCase(analytics),
    },
  ],
})
export class AnalyticsModule {}
