import type { GameState, Player } from "../types";

export default function getPlayer(players:Player[], playerId:number) : Player {
    const player = players.find(player=>player.id===playerId)
    if(!player){
        throw new Error(`Player ${playerId} not found`)
    }
    return player
}