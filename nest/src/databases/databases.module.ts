import { Module } from '@nestjs/common';
import { RedisService } from './redis/redis.service.js';
import { PostgresqlService } from './postgresql/postgresql.service.js';

@Module({
  providers: [RedisService, PostgresqlService]
})
export class DatabasesModule {}
