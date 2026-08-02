import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaService } from './prisma/prisma.service';
import { type EnvironmentVariables } from './config/env.validation';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const prismaService = app.get(PrismaService);
  const configService = app.get(ConfigService<EnvironmentVariables, true>);
  const port = configService.getOrThrow<number>('PORT');
  const webOrigin = configService.get<string>('WEB_ORIGIN');
  const nodeEnv =
    configService.getOrThrow<EnvironmentVariables['NODE_ENV']>('NODE_ENV');

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: webOrigin ? [webOrigin] : false,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('KinetiQ API')
      .setDescription('KinetiQ fitness development platform API')
      .setVersion('0.1.0')
      .addCookieAuth('better-auth.session_token')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  prismaService.enableShutdownHooks(app);
  await app.listen(port);
  Logger.log(`Server running on port ${port}`);
}
void bootstrap();
