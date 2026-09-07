import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedPrincipal } from '../../shared/infrastructure/auth/principal';
import { CurrentPrincipal } from '../../shared/infrastructure/auth/principal';
import { GetAnalyticsOverviewUseCase } from '../application/use-cases/get-analytics-overview.use-case';
import { AnalyticsOverviewQueryDto } from './dto/analytics-overview-query.dto';
import { AnalyticsOverviewResponseDto } from './dto/analytics-overview-response.dto';
import { toAnalyticsHttpException } from './analytics-exception.mapper';

@Controller('analytics')
@ApiTags('analytics')
@ApiCookieAuth('better-auth.session_token')
export class AnalyticsController {
  constructor(
    private readonly getAnalyticsOverview: GetAnalyticsOverviewUseCase,
  ) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get the authenticated user analytics overview' })
  @ApiQuery({
    name: 'timezone',
    required: true,
    type: String,
    example: 'Asia/Qatar',
  })
  @ApiQuery({
    name: 'from',
    required: false,
    type: String,
    format: 'date-time',
  })
  @ApiQuery({ name: 'to', required: false, type: String, format: 'date-time' })
  @ApiResponse({ status: 200, type: AnalyticsOverviewResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid analytics query' })
  @ApiResponse({
    status: 500,
    description: 'Analytics data could not be loaded',
  })
  async overview(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Query() query: AnalyticsOverviewQueryDto,
  ) {
    try {
      return await this.getAnalyticsOverview.execute({
        ownerId: principal.userId,
        timezone: query.timezone,
        from: query.from,
        to: query.to,
      });
    } catch (error) {
      throw toAnalyticsHttpException(error);
    }
  }
}
