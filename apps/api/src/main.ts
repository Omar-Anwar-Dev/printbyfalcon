import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as session from 'express-session';
import helmet from 'helmet';
import { createClient } from 'redis';
const { RedisStore } = require('connect-redis');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Trust nginx as reverse proxy so req.ip reflects the real client IP
  // (needed for rate limiter and audit logs)
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // ─── Security: Helmet headers ─────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: false, // disabled for iframes (Paymob)
      crossOriginEmbedderPolicy: false,
    }),
  );

  // ─── Redis client for sessions ────────────────────────────────────────────
  const redisClient = createClient({
    url: configService.get<string>('REDIS_URL'),
  });
  redisClient.connect().catch(console.error);

  // ─── Session middleware (guest cart lives here) ───────────────────────────
  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: configService.get<string>('SESSION_SECRET') || 'falcon-secret-change-me',
      resave: false,
      saveUninitialized: true,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: 'lax',
      },
      name: 'pbf.sid',
    }),
  );

  // ─── Global settings ──────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: [
      'https://printbyfalcon.com',
      'https://www.printbyfalcon.com',
      'http://localhost:3000',
    ],
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  const port = configService.get<number>('PORT') || 4000;
  await app.listen(port);
  console.log(`🚀 API running on port ${port}`);
}
bootstrap();
