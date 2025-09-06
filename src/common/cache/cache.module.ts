import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const redisUrl =
          configService.get<string>('REDIS_URL') || 'redis://localhost:6379';

        return {
          store: redisStore,
          url: redisUrl,
          ttl: 300, // 5 minutes default TTL
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
