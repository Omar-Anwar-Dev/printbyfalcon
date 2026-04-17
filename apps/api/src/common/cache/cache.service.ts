import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Thin Redis-backed cache with automatic mock fallback when REDIS_URL is absent
 * or the connection is unavailable. Never throws to the caller — a cache miss
 * looks the same as a cache bypass.
 */
@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redis: Redis | null = null;
  private available = false;

  constructor(private config: ConfigService) {
    const url = this.config.get<string>('REDIS_URL');
    if (!url) {
      this.logger.warn('CacheService: REDIS_URL not set — caching disabled');
      return;
    }
    try {
      this.redis = new Redis(url, {
        lazyConnect: false,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
      });
      this.redis.on('ready', () => { this.available = true; });
      this.redis.on('error', (err) => {
        if (this.available) this.logger.warn(`CacheService error: ${err.message}`);
        this.available = false;
      });
      this.redis.on('end', () => { this.available = false; });
    } catch (err: any) {
      this.logger.warn(`CacheService init failed: ${err.message}`);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis || !this.available) return null;
    try {
      const raw = await this.redis.get(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!this.redis || !this.available) return;
    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch {
      // swallow — caching is best-effort
    }
  }

  async del(pattern: string): Promise<void> {
    if (!this.redis || !this.available) return;
    try {
      // Use SCAN to find keys matching pattern, then DEL in batches
      let cursor = '0';
      do {
        const [next, keys] = await this.redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = next;
        if (keys.length > 0) await this.redis.del(...keys);
      } while (cursor !== '0');
    } catch {
      // swallow
    }
  }

  /**
   * Read-through helper: look up the key; on miss, compute the fresh value,
   * store it with the given TTL, and return it.
   */
  async remember<T>(key: string, ttlSeconds: number, compute: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const fresh = await compute();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }

  async onModuleDestroy() {
    if (this.redis) {
      try { await this.redis.quit(); } catch { /* ignore */ }
    }
  }
}
