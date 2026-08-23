import {
  Module,
  type MiddlewareConsumer,
  type NestModule,
} from '@nestjs/common';
import { SharedConfigModule } from '../config/shared-config.module';
import { OriginCheckMiddleware } from './origin-check.middleware';

@Module({
  imports: [SharedConfigModule],
})
export class SharedSecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(OriginCheckMiddleware).forRoutes('*');
  }
}
