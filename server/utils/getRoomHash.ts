
import type { Room } from "../../shared/types/room.types.js";
import { getRedis } from "./connectRedis.js";
import type { GameState } from "../../shared/types/gamestate.types.js";

export default async function getRoomHash(
  id:string,
): Promise<Room | undefined> {
  try {
    if (id) {
      const redisClient = getRedis();
      const kRoom = `room:${id}`;
      const kGameState = `room:${id}:state`;
      const kPlayers = `room:${id}:players`;
      const kDeck = `room:${id}:deck`;
      const kCurrentCards = `room:${id}:currentcards`;
      const kLeftovers = `room:${id}:leftovers`;
      const roomRaw = await redisClient.hGetAll(kRoom);
      const stateRaw = await redisClient.hGetAll(kGameState);
      const playersRaw = await redisClient.get(kPlayers);
      const deckRaw = await redisClient.get(kDeck);
      const currentCardsRaw = await redisClient.get(kCurrentCards);
      const leftoversRaw = await redisClient.get(kLeftovers);
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