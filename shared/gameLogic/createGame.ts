import { type Deck, type GameState, type Player } from "../types/index.ts";
import createDeck from "./createDeck.ts";
import { initializePlayer } from "./initializePlayer.ts";
export default function createGame(numberOfPlayers:number, playerName:string) : GameState  {
    const deck : Deck = createDeck()
    const player : Player= initializePlayer(playerName, 0)
    const players : Player[] = [player]
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
        playersOnline:0
    }

}