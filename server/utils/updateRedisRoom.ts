import type { Room } from "../../shared/types/room.types.js";
import { getRedis } from "./connectRedis.js";

export default async function updateRedisRoom(room:Room) {
    try{
        const roomId = room.roomId
        const redisClient = getRedis()
        const kRoom = `room:${roomId}`;
      const kGameState = `room:${roomId}:state`;
      const kPlayers = `room:${roomId}:players`;
      const kDeck = `room:${roomId}:deck`;
      const kCurrentCards = `room:${roomId}:currentcards`;
      const kLeftovers = `room:${roomId}:leftovers`;
      await redisClient
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
    }
    catch(err){
        console.error(`Error occured during redis room updating.`, err)
        throw new Error(`Error occured during redis room updating.`,{cause:err})
    }
}