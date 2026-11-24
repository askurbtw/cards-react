import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import CreateRoomRequest from '../../../shared/types/createroomtype.types.js';
import createGame from '../../../shared/gameLogic/createGame.js';
import { RedisService } from '../databases/redis/redis.service.js';
import { PostgresqlService } from '../databases/postgresql/postgresql.service.js';
import gameView from '../../../server/utils/gameView.js';
import { initializePlayer } from '../../../shared/gameLogic/initializePlayer.js';
import beginGame from '../../../server/utils/beginGame.js';
import { Room } from '../../../shared/types/room.types.js';

@Injectable()
export class RoomsService {
  constructor(
    private readonly redis: RedisService,
    private readonly pool: PostgresqlService,
  ) {}
  async createRoom(data: CreateRoomRequest) {
    try {
      const roomId = randomUUID();
      console.log(data);
      const state = createGame(data.numberOfPlayers, data.gameType);
      const room = {
        roomId,
        state,
        tokens: new Map(),
        sockets: new Map(),
      };
      await this.pool.createRoom(roomId, data.gameType);
      await this.redis.updateRoom(room);
      const response = {
        roomId,
        state: gameView(state, roomId),
      };
      return response;
    } catch (err) {
      console.error(`Error:`, err);
      throw new Error(`Error during room creation`, { cause: err });
    }
  }
  async joinRoom(data: {
    roomId: string;
    playerName: string;
    socketId: string;
  }): Promise<Room | undefined> {
    const room = await this.redis.getRoom(data.roomId);
    if (!room) return;
    if (room.state.numberOfPlayers === room.state.playersOnline) return;
    const player = initializePlayer(data.playerName, room.state.playersOnline);
    const playerUUID = await this.pool.createUser(data.playerName);
    if (!playerUUID) return;
    const playerToken = randomUUID();
    room.state.players.push(player);
    const result = await this.pool.updateRoom(data.roomId, [
      { type: 'players_ids', ids: [playerUUID] },
    ]);
    if (!result) {
      return;
    }
    room.sockets.set(data.socketId, playerToken);
    room.tokens.set(playerToken, player.id);
    room.state.playersOnline += 1;
    console.log('Joining2');
    if (room.state.playersOnline === room.state.numberOfPlayers) {
      console.log('Full');
      const newState = beginGame(room.state);
      if (newState) {
        room.state = newState;
        await this.redis.updateRoom(room);
        console.log(room.state);
        return room;
      }
    }
    console.log('Joining3');
    await this.redis.updateRoom(room);
    return room;
  }
  async rejoinRoom(data: {
    roomID: string;
    token: string;
    socketId: string;
  }): Promise<Room | undefined> {
    const room = await this.redis.getRoom(data.roomID);
    if (!room) {
      console.log('No room');
      return;
    }
    const playerID = room.tokens.get(data.token);
    if (playerID === undefined) {
      console.log('No player');
      return;
    }
    room.sockets.set(data.socketId, data.token);
    await this.redis.updateRoom(room);
    return room;
  }
  async disconnect(data: { roomID: string; socketID: string }) {
    const room = await this.redis.getRoom(data.roomID);
    if (!room) return;
    const result = room.sockets.delete(data.socketID);
    await this.redis.updateRoom(room);
    return result;
  }
}
