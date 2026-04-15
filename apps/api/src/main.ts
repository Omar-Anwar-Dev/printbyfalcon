import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as session from 'express-session';
import { createClient } from 'redis';
const { RedisStore } = require('connect-redis');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

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
      saveUninitialized: true,   // creates session for guests immediately
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24, // 24 hours for guests
        sameSite: 'lax',
      },
      name: 'pbf.sid',           // custom cookie name
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
    credentials: true,   // IMPORTANT: allows cookies to be sent cross-origin
  });

  app.setGlobalPrefix('api/v1');

  const port = configService.get<number>('PORT') || 4000;
  await app.listen(port);
  console.log(`🚀 API running on port ${port}`);
}
bootstrap();
