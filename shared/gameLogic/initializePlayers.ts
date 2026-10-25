
import { type GameState } from "../types/index.ts";
import { initializePlayerCard } from "./initializePlayerCard.ts";



export function initializePlayers(state: GameState): GameState{
    const newState = structuredClone(state)
    if(newState.players.length!==0){
        for(let i=0;i<newState.numberOfPlayers*6;i++){
            initializePlayerCard(newState.deck,newState.players[i%newState.numberOfPlayers])
           
        }
    }
    
    
    
    return newState

}