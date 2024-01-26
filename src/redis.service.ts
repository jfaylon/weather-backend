import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

export type RedisClient = Redis;

@Injectable()
export class RedisService {
  private readonly redisClient: RedisClient;

  constructor() {
    this.redisClient = new Redis(process.env.REDIS_URL);
  }

  getClient(): RedisClient {
    return this.redisClient;
  }
}
