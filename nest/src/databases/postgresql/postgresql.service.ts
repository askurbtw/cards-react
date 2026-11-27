import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { Pool, QueryResult } from 'pg';
import { DomainError } from '../../common/errors/domain.error.js';


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

type PlayerUpdate = {
  type: 'players_ids';
  ids: Array<string>;
};
type StatusUpdate = {
  type: 'status';
  status: 'waiting for players' | 'playing' | 'finished';
};
type ResultUpdate = {
  type: 'result';
  result: Array<Record<number,string>>;
};
type FinishedAtUpdate = {
  type:'finished_at',
  finished_at : string
}
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
    if (this.pool) {
      await this.pool.end();
    }
  }
  async createRoom(roomId: string, gameType: 's' | 'm') :Promise<QueryResult> {

    try {
      if(!this.pool){
        throw new Error(`Pool is not initialized yet.`);
      }
      const game_type = gameType === 's' ? 'singleplayer' : 'multiplayer';
      const status = 'waiting for players';
      const query = `INSERT INTO rooms (id,status, game_type)
    VALUES($1,$2,$3)
    RETURNING id,players_ids,status,result,created_at,finished_at`;
      const result = await this.pool.query(query, [roomId, status, game_type]);
      console.log(result);
      if(!result.rows[0]) throw new DomainError(`INTERNAL_ERROR`, `Couldn't create new room.`)
      return result
    } catch (err) {
      throw new Error(`Error during room creation`, { cause: err });
    }
  }
  async updateRoom(
    roomID: string,
    queryData: Array<PlayerUpdate | StatusUpdate | ResultUpdate | FinishedAtUpdate>,
  ) : Promise<void> {
    try {
      if(!this.pool){
        throw new Error(`Pool is not initialized yet.`);
      }
      if (queryData.length === 0) {
        throw new Error(`Query data was not specified.`)
      }
      const values: Array<string | Array<string> | object> = [roomID];
      const setClauses: string[] = [];
      const whereClauses: string[] = ['id = $1::uuid'];

      queryData.forEach((query) => {
        if (query.type === 'players_ids') {
          query.ids.forEach((id) => {
            const paramsIndex = values.length + 1;
            setClauses.push(
              `players_ids = CASE WHEN NOT(players_ids ? $${paramsIndex}::text) THEN players_ids || jsonb_build_array($${paramsIndex}::text) ELSE players_ids END`,
            );
            values.push(id);
          });
        }
        if (query.type === 'result') {
          const paramsIndex = values.length + 1;
          setClauses.push(`result = $${paramsIndex}::jsonb`);
          values.push(JSON.stringify(query.result));
        }
        
        if (query.type === 'status') {
          const paramsIndex = values.length + 1;
          setClauses.push(`status = $${paramsIndex}`);
          values.push(query.status);
        }
        if(query.type === 'finished_at'){
          const paramsIndex = values.length + 1;
          setClauses.push(`finished_at = $${paramsIndex}`);
          values.push(query.finished_at);
        }
      });
      if (setClauses.length === 0) {
        throw new Error(`No set clauses.`);
      }
      console.log([...setClauses]);
      console.log([...whereClauses]);
      const sql = `UPDATE rooms
    SET ${setClauses.join(', ')}
    WHERE ${whereClauses.join(' AND ')}
    RETURNING *`;
      console.log(sql);
      console.log(values);
      const result = await this.pool.query(sql, values);
      console.log(result?.rows[0], 'result');
      if(!result.rows[0]) throw new Error('Something went wrong during room update')
      
    } catch (err) {
      console.error(`Error during room update`, err);
      throw new Error(`Error during room update`, { cause: err });
    }
  }
  async createUser(nickname:string) : Promise<string>{
    const id = randomUUID()
        const query = `INSERT INTO users(id,nickname)
        VALUES ($1,$2)
        RETURNING id,nickname,created_at`
        const result = await this.pool.query(query,[id,nickname])
        console.log(result.rows[0])
        if(!result.rows[0]) throw new DomainError(`INTERNAL_ERROR`, `Couldn't create new user.`)
        return id
  }
  getPool(): Pool {
    if (this.pool) {
      return this.pool;
    }
    throw new Error(`Pool is not initialized yet.`);
  }
}
