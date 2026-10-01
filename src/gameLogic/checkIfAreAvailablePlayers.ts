import type { Player } from "../types";
import endGame from "./endGame";

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