import { type GameState } from "../types/index.ts";
import createDeck from "./createDeck.ts";
import { initializePlayers } from "./initializePlayers.ts";
export default function createGame(numberOfPlayers:number, playerName:string) : GameState  {
    const deck = createDeck()
    const [players, newDeck] = initializePlayers(numberOfPlayers, playerName, deck)
    return {
        players:players,
        deck:newDeck,
        currentCards:[],
        attackerId:players[0].id,
        defenderId:players[1].id,
        currentId:players[0].id,
        leftovers:[],
        movesCounter:1,
        disablePassButton:true,
        status: 'playing',
        finishOrder: [],
    }

}