import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, type RedisClientType } from 'redis';
import customDelay from '../../../../shared/utils/customDelay.js';
import { Room } from '../../../../shared/types/room.types.js';
import { GameState } from '../../../../shared/types/gamestate.types.js';
async function connectWithTimeout(
  client: RedisClientType,
  delay: number,
): Promise<void> {
  let timerId: ReturnType<typeof setTimeout> | undefined;

  try {
    await Promise.race([
      client.connect(),
      new Promise<never>((_, rej) => {
        timerId = setTimeout(() => {
          rej(new Error(`Redis connect timed out`));
        }, delay);
      }),
    ]);
  } finally {
    if (timerId) {
      clearTimeout(timerId);
    }
  }
}

const parseFullStateHash = (stateRaw: {[x:string]:string},playersRaw:string, deckRaw:string, currentCardsRaw:string, leftoversRaw:string) : GameState =>{
    const players = JSON.parse(playersRaw)
    const deck = JSON.parse(deckRaw)
    const currentCards = JSON.parse(currentCardsRaw)
    const leftovers = JSON.parse(leftoversRaw)
    return {
        numberOfPlayers: Number(JSON.parse(stateRaw["numberOfPlayers"])),
        players,
        deck,
        playersOnline: Number(JSON.parse(stateRaw["playersOnline"])),
        currentCards,
        attackerId:Number(JSON.parse(stateRaw["attackerId"])),
        defenderId:Number(JSON.parse(stateRaw["defenderId"])),
        currentId:Number(JSON.parse(stateRaw["currentId"])),
        leftovers,
        movesCounter:Number(JSON.parse(stateRaw["movesCounter"])),
        disablePassButton:Boolean(JSON.parse(stateRaw["disablePassButton"])),
        status:JSON.parse(stateRaw["status"]),
        finishOrder:JSON.parse(stateRaw["finishOrder"]),
        isSinglePlayer:Boolean(JSON.parse(stateRaw["isSinglePlayer"])),
    }
}

const parseFullRoom = (roomId:string, roomRaw:{[x:string]:string}, state:GameState) : Room=>{
    const tokensEntries = JSON.parse(roomRaw["tokens"]) as [string,number][]
    const socketsEntries = JSON.parse(roomRaw["sockets"]) as [string,string][]
    return{
        roomId,
        state,
        tokens:new Map(tokensEntries),
        sockets:new Map(socketsEntries)
    }
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: RedisClientType;

  async onModuleInit() {
    const retries = 5;
    const delayMs = 1000;
    for (let i = 1; i <= retries; i++) {
      const client = createClient({
        username: 'default',
        password: process.env.REDIS_PASSWORD,
        socket: {
          host: process.env.REDIS_URL,
          port: Number(process.env.REDIS_PORT),
          connectTimeout: 5000,
        },
      });
      client.on('error', (err) => {
        console.error(`Redis client error:`, err);
      });
      try {
        await connectWithTimeout(client, 3000);
        console.log('redis client connected');
        client.on('reconnecting', () => {
          console.warn(`Redis is reconnecting...`);
        });
        client.on('ready', () => {
          console.log(`Redis is ready.`);
        });
        this.redisClient = client;
        return;
      } catch (err) {
        console.warn(`Redis couldn't connect on ${i} try.`);
        client.destroy();
        if (i === retries) {
          throw new Error(`Redis couln't connect after ${retries} attempts.`, {
            cause: err,
          });
        }
        const delay = delayMs * i;
        await customDelay(delay);
      }
    }
  }
  async onModuleDestroy() {
    if (this.redisClient) await this.redisClient.quit();
  }
  async updateRoom(room: Room) {
    try {
      if (!this.redisClient) {
        throw new Error(`Redis client is not initialized yet.`);
      }
      const roomId = room.roomId;
      const kRoom = `room:${roomId}`;
      const kGameState = `room:${roomId}:state`;
      const kPlayers = `room:${roomId}:players`;
      const kDeck = `room:${roomId}:deck`;
      const kCurrentCards = `room:${roomId}:currentcards`;
      const kLeftovers = `room:${roomId}:leftovers`;
      await this.redisClient
        .multi()
        .hSet(kRoom, {
          numberOfPlayers: room.state.numberOfPlayers,
          playersOnline: room.state.playersOnline,
          sockets: JSON.stringify(Array.from(room.sockets.entries())),
          tokens: JSON.stringify(Array.from(room.tokens.entries())),
        })
        .hSet(kGameState, {
          numberOfPlayers: room.state.numberOfPlayers,
          playersOnline: room.state.playersOnline,
          attackerId: room.state.attackerId,
          defenderId: room.state.defenderId,
          currentId: room.state.currentId,
          movesCounter: room.state.movesCounter,
          disablePassButton: String(room.state.disablePassButton),
          status: JSON.stringify(room.state.status),
          isSinglePlayer: JSON.stringify(room.state.isSinglePlayer),
          finishOrder: JSON.stringify(room.state.finishOrder),
        })
        .set(kPlayers, JSON.stringify(room.state.players))
        .set(kDeck, JSON.stringify(room.state.deck))
        .set(kCurrentCards, JSON.stringify(room.state.currentCards))
        .set(kLeftovers, JSON.stringify(room.state.leftovers))
        .exec();
    } catch (err) {
      console.error(`Error occured during redis room updating.`, err);
      throw new Error(`Error occured during redis room updating.`, {
        cause: err,
      });
    }
  }
  async getRoom(id:string){
    try {
      if (!this.redisClient) {
        throw new Error(`Redis client is not initialized yet.`);
      }
    if (id) {
      const kRoom = `room:${id}`;
      const kGameState = `room:${id}:state`;
      const kPlayers = `room:${id}:players`;
      const kDeck = `room:${id}:deck`;
      const kCurrentCards = `room:${id}:currentcards`;
      const kLeftovers = `room:${id}:leftovers`;
      const roomRaw = await this.redisClient.hGetAll(kRoom);
      const stateRaw = await this.redisClient.hGetAll(kGameState);
      const playersRaw = await this.redisClient.get(kPlayers);
      const deckRaw = await this.redisClient.get(kDeck);
      const currentCardsRaw = await this.redisClient.get(kCurrentCards);
      const leftoversRaw = await this.redisClient.get(kLeftovers);
      if(!roomRaw||!stateRaw||!playersRaw||!deckRaw||!currentCardsRaw||!leftoversRaw ) throw new Error()
      const state = parseFullStateHash(stateRaw, playersRaw, deckRaw,currentCardsRaw,leftoversRaw)
    const room = parseFullRoom(id,roomRaw,state)
    return room
    }
    return undefined
  } catch (err) {
    console.error(err);
    throw new Error(`Error getting room.`, {cause:err})
  }
  }
  getRedis(): RedisClientType {
    if (this.redisClient) {
      return this.redisClient;
    }
    throw new Error(`Redis client is not initialized yet.`);
  }
}
