import 'dotenv/config';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Global API Prefix
  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Response Formatter
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global Exception Handler
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = configService.get<number>('PORT') || 3001;

  await app.listen(port);

  console.log('========================================');
  console.log(`🚀 Stream Nepal CMS Backend Started`);
  console.log(`🌐 URL: http://localhost:${port}/api`);
  console.log('========================================');
}

bootstrap();