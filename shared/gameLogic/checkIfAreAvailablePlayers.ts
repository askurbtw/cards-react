import type { Player } from "../types/index.ts";
import endGame from "./endGame.ts";

export default function checkIfAreAvailablePlayers(players:Player[]) : boolean {
    let availablePlayersCount = 0
    players.forEach(player => 
        player.isOutOfCards===false?availablePlayersCount++:null
    );
    if(availablePlayersCount>=2){
        return true
    }
    else{
        endGame()
        return false
    }
}