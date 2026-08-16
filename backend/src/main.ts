import 'dotenv/config';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);

  // Global API Prefix
  app.setGlobalPrefix('api');

  // Serve uploaded files (local storage provider)
  const uploadDir = configService.get<string>('UPLOAD_DIR', 'uploads');

  app.useStaticAssets(join(process.cwd(), uploadDir), {
    prefix: `/${uploadDir}/`,
  });

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
