import { Controller, Get } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { HealthService } from './health.service';

@Controller('health')
@AllowAnonymous()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  check() {
    return this.healthService.checkReadiness();
  }

  @Get('live')
  live() {
    return { status: 'ok' as const };
  }

  @Get('ready')
  ready() {
    return this.healthService.checkReadiness();
  }
}
