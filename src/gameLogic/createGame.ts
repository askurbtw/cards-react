import { type GameState } from "../types";
import createDeck from "./createDeck";
import { initializePlayers } from "./initializePlayers";
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
        movesCounter:1
    }

}