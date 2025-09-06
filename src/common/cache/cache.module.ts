import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Keyv } from 'keyv';
import KeyvRedis from '@keyv/redis';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const redisUrl =
          configService.get<string>('REDIS_URL') || 'redis://localhost:6379';

        return {
          store: () =>
            new Keyv({
              store: new KeyvRedis(redisUrl),
              ttl: 300000, // 5 minutes default TTL (in milliseconds)
            }),
          ttl: 300, // 5 minutes default TTL (in seconds for cache-manager)
          max: 1000, // Maximum number of items in cache
        };
      },
      inject: [ConfigService],
      isGlobal: true,
    }),
  ],
  exports: [CacheModule],
})
export class RedisCacheModule {}
