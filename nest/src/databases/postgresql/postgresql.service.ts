import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { Pool } from 'pg';

const getDBURL = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(`Error during getting db url`);
  }
  const parsed = new URL(url);
  console.log({
    protocol: parsed.protocol,
    hostname: parsed.hostname,
    port: parsed.port,
    pathname: parsed.pathname,
    hasUsername: Boolean(parsed.username),
    hasPassword: Boolean(parsed.password),
  });
  return url;
};

@Injectable()
export class PostgresqlService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  onModuleInit() {
    this.pool = new Pool({
      connectionString: getDBURL(),
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
    this.pool.on('error', (err) => {
      console.error('Postgre error: ', err);
    });

    this.pool.on('connect', () => {
      console.log(
        `Pool size is now ${this.pool.totalCount} out of ${this.pool.options.max}. ${this.pool.idleCount} connections are idling. ${this.pool.waitingCount} queries are waiting.`,
      );
    });
  }
  async onModuleDestroy() {
      if(this.pool){
        await this.pool.end()
      }
  }
  getPool() : Pool{
    if(this.pool){
        return this.pool
    }
    throw new Error(`Pool is not initialized yet.`)
  }
}
