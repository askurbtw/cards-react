import { Injectable } from '@nestjs/common';
import { RedisService } from '../databases/redis/redis.service.js';
import { PostgresqlService } from '../databases/postgresql/postgresql.service.js';
import checkValidCard from '../../../shared/gameLogic/checkValidCard.js';
import makeMove from '../../../shared/gameLogic/makeMove.js';
import endRound from '../../../shared/gameLogic/endRound.js';
import playBotMoves from '../../../server/utils/playBotMoves.js';
import { GameView } from '../../../shared/types/gameView.types.js';
import { Room } from '../../../shared/types/room.types.js';


@Injectable()
export class GamesService {
    constructor(private readonly redisService:RedisService, private readonly posgresqlService:PostgresqlService) {}
    async makeMove(data: {roomID:string, socketID:string, cardID:string }) : Promise<{room:Room, stateHistory: GameView[] | null} |undefined>{
        const room = await this.redisService.getRoom(data.roomID);

    if (!room) {
      console.log("No room");
      return;
    }
    const token = room?.sockets.get(data.socketID);
    if (!token) {
      console.log("No token");
      return;
    }

    const playerID = room.tokens.get(token);

    if (playerID === undefined) {
      console.log("No player");
      return 
    }
    const isPlayerTurn = room?.state.currentId === playerID ? true : false;
    if (!room || !isPlayerTurn) {
      console.log("No room");
      return 
    }
    const moveType =
      room.state.currentId === room.state.attackerId ? "attack" : "defence";
    const { isCardValid, card } = checkValidCard(data.cardID, room.state, moveType);
    if (!isCardValid || !card) {
      console.log("Invalid move.");
      return 
    }
    const nextState = makeMove(room.state, card);
    
    if (!nextState) {
      return 
    }
    
    room.state = nextState;
    if (
      moveType === "attack"
        ? room.state.players.find(
            (player) => player.id === room.state.defenderId,
          )?.cards.length === 0
        : room.state.players.find(
            (player) => player.id === room.state.attackerId,
          )?.cards.length === 0
    ) {
      const newState = endRound(room.state, false);
      room.state = newState;
    }
    let stateHistory : GameView[] | null = null
    if (room.state.isSinglePlayer) {
       stateHistory = playBotMoves(room);
    }
    await this.redisService.updateRoom(room);
    if (room.state.status === "finished") {
      await this.posgresqlService.updateRoom(data.roomID,[{type:'status', status:'finished'}])
    
    }
    return {room, stateHistory}
    }
}
