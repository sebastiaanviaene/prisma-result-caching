import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { createPrismaRedisCache } from 'prisma-redis-middleware';
import Redis from 'ioredis';
import Prisma from 'prisma';

const redis = new Redis();
const cacheMiddleware: Prisma.Middleware = createPrismaRedisCache({
  models: [
    { model: 'User', cacheTime: 5 },
    { model: 'Post', cacheTime: 5, cacheKey: 'article' },
  ],
  storage: {
    type: 'redis',
    options: {
      client: redis,
      invalidation: { referencesTTL: 300 },
      log: console,
    },
  },
  cacheTime: 300,
  excludeMethods: ['count', 'groupBy'],
  onHit: (key) => {
    console.log('hit', key);
  },
  onMiss: (key) => {
    console.log('miss', key);
  },
  onError: (key) => {
    console.log('error', key);
  },
});

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      //   log: ['error', 'info', 'query', 'warn'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.$use(cacheMiddleware);
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
