import {
  Module,
  type MiddlewareConsumer,
  type NestModule,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthRateLimitMiddleware } from './auth-rate-limit.middleware';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        limit: 120,
        ttl: 60_000,
      },
    ]),
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
  exports: [ThrottlerModule],
})
export class SharedRateLimitModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AuthRateLimitMiddleware).forRoutes('*');
  }
}
