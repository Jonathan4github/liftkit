import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // In production set FRONTEND_URL to the dashboard origin; locally we reflect any origin.
  const frontendUrl = process.env.FRONTEND_URL;
  app.enableCors({ origin: frontendUrl ? frontendUrl.split(',') : true });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();