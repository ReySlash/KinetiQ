import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { type EnvironmentVariables } from './modules/shared/infrastructure/config/env.validation';
import { configureApp, logServerStarted } from './app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const configService = app.get(ConfigService<EnvironmentVariables, true>);
  const port = configService.getOrThrow<number>('PORT');
  configureApp(app);
  await app.listen(port);
  logServerStarted(port);
}
void bootstrap();
