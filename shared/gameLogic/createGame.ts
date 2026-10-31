import { type Deck, type GameState, type Player } from "../types/index.ts";
import createDeck from "./createDeck.ts";
export default function createGame(numberOfPlayers:number, gameType:'s' | 'm') : GameState  {
    const deck : Deck = createDeck()
    const players : Player[] = []
    return {
        numberOfPlayers,
        players:players,
        deck,
        currentCards:[],
        attackerId:0,
        defenderId:0,
        currentId:0,
        leftovers:[],
        movesCounter:1,
        disablePassButton:true,
        status: "waiting for players",
        finishOrder: [],
        playersOnline:0,
        isSinglePlayer:gameType==='s'?true:false
    }

}