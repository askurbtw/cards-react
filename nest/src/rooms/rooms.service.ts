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
import { DomainError } from '../common/errors/domain.error.js';
import playBotMoves from '../../../server/utils/playBotMoves.js';

@Injectable()
export class RoomsService {
  constructor(
    private readonly redis: RedisService,
    private readonly pool: PostgresqlService,
  ) {}
  async createRoom(data: CreateRoomRequest)  {
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
      throw new DomainError('INTERNAL_ERROR', 'Something went wrong during room creation.')
    }
  }
  async joinRoom(data: {
    roomId: string;
    playerName: string;
    socketId: string;
  }): Promise<Room> {
    const room = await this.redis.getRoom(data.roomId);
    if (room.state.numberOfPlayers === room.state.playersOnline) throw new DomainError('CONFLICT', 'Room is full.');
    const playerUUID = await this.pool.createUser(data.playerName);
    const player = initializePlayer(data.playerName, playerUUID, room.state.playersOnline);
    const playerToken = randomUUID();
    room.state.players.push(player);
    await this.pool.updateRoom(data.roomId, [
      { type: 'players_ids', ids: [playerUUID] },
    ]);
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
  }): Promise<{room:Room, playerId:number}> {
    console.log("Rejoining")
    const room = await this.redis.getRoom(data.roomID);
    const playerID = room.tokens.get(data.token);
    if (playerID === undefined) {
      throw new DomainError('CONFLICT', 'No token.')
    }
    room.sockets.set(data.socketId, data.token);
    await this.redis.updateRoom(room);
    return {room, playerId:playerID};
  }

  async disconnect(data: { roomID: string; socketID: string }) {
    const room = await this.redis.getRoom(data.roomID);
    const result = room.sockets.delete(data.socketID);
    if(result===false) throw new Error(`Something went wrong.`)
    await this.redis.updateRoom(room);
    
  }

  async joinSinglePlayer(roomId:string, playerName:string, socketId:string){
  
    const room = await this.redis.getRoom(roomId);
    if (!room) throw new DomainError(`NOT_FOUND`,'Room not found.')
    
    const playerUUID = await this.pool.createUser(playerName);
    const player = initializePlayer(playerName, playerUUID, room.state.playersOnline);
    const playerToken = randomUUID();
    room.state.players.push(player);
    await this.pool.updateRoom(roomId, [
      { type: "players_ids", ids: [playerUUID] },
    ]);
  
    
    room.sockets.set(socketId, playerToken);
    room.tokens.set(playerToken, player.id);
    room.state.playersOnline += 1;
    let counter = room.state.players.length;
    for (counter; counter < room.state.numberOfPlayers; counter++) {
      const newBot = initializePlayer(
        `Bot#${counter}`,
        '',
        room.state.players.length,
      );
      room.state.players.push(newBot);
      room.state.playersOnline += 1;
    }
    const newState = beginGame(room.state);
    console.log(newState);
    room.state = newState;
    await this.redis.updateRoom(room);
    
    if (newState && newState.currentId !== player.id) {
      const stateHistory = playBotMoves(room);
      await this.redis.updateRoom(room);
      
      return {stateHistory, room, playerId:player.id, playerToken}
    } else {
      return {stateHistory:null, room, playerId:player.id, playerToken}
    }
    
  }
}
