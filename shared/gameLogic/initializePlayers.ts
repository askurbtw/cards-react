
import { type GameState } from "../types/index.js";
import { initializePlayerCard } from "./initializePlayerCard.js";



export function initializePlayers(state: GameState): GameState{
    const newState = structuredClone(state)
    if(newState.players.length!==0){
        for(let i=0;i<newState.players.length*6;i++){
            initializePlayerCard(newState.deck,newState.players[i%newState.players.length])
           
        }
    }
    
    
    
    return newState

}