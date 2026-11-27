import { Injectable } from '@nestjs/common';
import { RedisService } from '../databases/redis/redis.service.js';
import { PostgresqlService } from '../databases/postgresql/postgresql.service.js';
import checkValidCard from '../../../shared/gameLogic/checkValidCard.js';
import makeMove from '../../../shared/gameLogic/makeMove.js';
import endRound from '../../../shared/gameLogic/endRound.js';
import playBotMoves from '../../../server/utils/playBotMoves.js';
import { GameView } from '../../../shared/types/gameView.types.js';
import { Room } from '../../../shared/types/room.types.js';
import { DomainError } from '../common/errors/domain.error.js';
import makePass from '../../../shared/gameLogic/makePass.js';


@Injectable()
export class GamesService {
    constructor(private readonly redisService:RedisService, private readonly posgresqlService:PostgresqlService) {}
    async makeMove(data: {roomID:string, socketID:string, cardID:string }) : Promise<{room:Room, stateHistory: GameView[] | null}>{
      
        const room = await this.redisService.getRoom(data.roomID);

    if (!room) {
      throw new DomainError('NOT_FOUND','Room not found')
    }
    const token = room?.sockets.get(data.socketID);
    if (!token) {
      throw new DomainError('FORBIDDEN','No token')
    }

    const playerID = room.tokens.get(token);

    if (playerID === undefined) {
      throw new DomainError('NOT_FOUND','Player not found')
    }
    const isPlayerTurn = room?.state.currentId === playerID ? true : false;
    if (!isPlayerTurn) {
      throw new DomainError('CONFLICT', 'Not your turn.')
    }
    const moveType =
      room.state.currentId === room.state.attackerId ? "attack" : "defence";
    console.log(data.cardID, room.state, moveType)
    const { isCardValid, card } = checkValidCard(data.cardID, room.state, moveType);
    console.log(isCardValid, card)
    if (!isCardValid || !card) {
      throw new DomainError('CONFLICT', 'Move is not valid.')
    }
    const nextState = makeMove(room.state, card);
    
    if (!nextState) {
      throw new DomainError('INTERNAL_ERROR', 'Something went wrong.')
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
      const finishOrder = room.state.finishOrder.map((player,index)=> {return {...player, finishOrder : index+1}}).filter((player)=>player.playerUUID!=='')
      await this.posgresqlService.updateRoom(data.roomID,[{type:'status', status:'finished'},
        {type:'result', result:finishOrder},
        {type:'finished_at', finished_at: new Date().toISOString()}
      ])  
    }
    return {room, stateHistory}
    }
    async makePass(data: {roomID:string, socketID:string, cardID:string }) : Promise<{room:Room, stateHistory: GameView[] | null}>{
        const room = await this.redisService.getRoom(data.roomID);

    if (!room) {
      throw new DomainError('NOT_FOUND','Room not found')
    }
    const token = room?.sockets.get(data.socketID);
    if (!token) {
      throw new DomainError('FORBIDDEN','No token')
    }

    const playerID = room.tokens.get(token);

    if (playerID === undefined) {
      throw new DomainError('NOT_FOUND','Player not found')
    }
    const isPlayerTurn = room?.state.currentId === playerID ? true : false;
    if (!isPlayerTurn) {
      throw new DomainError('CONFLICT', 'Not your turn.')
    }
    
    
    const nextState = makePass(room.state);
    
    if (!nextState) {
      throw new DomainError('INTERNAL_ERROR', 'Something went wrong.')
    }
    
    room.state = nextState;
    let stateHistory : GameView[] | null = null
    if (room.state.isSinglePlayer) {
      stateHistory = playBotMoves(room);
      
    } 
    await this.redisService.updateRoom(room);
    if (room.state.status === "finished") {
      const finishOrder = room.state.finishOrder.map((player,index)=> {return {...player, finishOrder : index+1}}).filter((player)=>player.playerUUID!=='')
      await this.posgresqlService.updateRoom(data.roomID,[{type:'status', status:'finished'},
        {type:'result', result:finishOrder},
        {type:'finished_at', finished_at: new Date().toISOString()}
      ])  
    }
    return {room, stateHistory}
    }
}
