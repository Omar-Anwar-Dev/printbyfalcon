import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private client: any;

  constructor() {
    // Dynamic import to avoid build-time resolution issues
    const { PrismaClient } = require('@prisma/client');
    this.client = new PrismaClient();
    // Proxy all prisma model calls through this service
    return new Proxy(this, {
      get: (target, prop) => {
        if (prop in target) return (target as any)[prop];
        return (this.client as any)[prop];
      },
    });
  }

  async onModuleInit() {
    await this.client.$connect();
    console.log('✅ Database connected');
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
