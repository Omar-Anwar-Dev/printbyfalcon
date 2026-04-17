import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { createClient } from 'redis';
import axios from 'axios';

@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  @Get()
  async check() {
    const [db, redis, meili] = await Promise.all([
      this.checkDb(),
      this.checkRedis(),
      this.checkMeili(),
    ]);

    const allUp = db.status === 'up' && redis.status === 'up' && meili.status === 'up';
    return {
      status: allUp ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'printbyfalcon-api',
      dependencies: { db, redis, meili },
    };
  }

  private async checkDb() {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'up', latencyMs: Date.now() - start };
    } catch (e: any) {
      return { status: 'down', error: e.message };
    }
  }

  private async checkRedis() {
    const start = Date.now();
    const url = this.config.get<string>('REDIS_URL');
    if (!url) return { status: 'skipped', reason: 'REDIS_URL not configured' };
    const client = createClient({ url });
    try {
      await client.connect();
      await client.ping();
      await client.quit();
      return { status: 'up', latencyMs: Date.now() - start };
    } catch (e: any) {
      try { await client.quit(); } catch {}
      return { status: 'down', error: e.message };
    }
  }

  private async checkMeili() {
    const start = Date.now();
    const host = this.config.get<string>('MEILI_HOST', 'http://meilisearch:7700');
    try {
      const res = await axios.get(`${host}/health`, { timeout: 3000 });
      return { status: res.data?.status === 'available' ? 'up' : 'down', latencyMs: Date.now() - start };
    } catch (e: any) {
      return { status: 'down', error: e.message };
    }
  }
}
