import type { GameState, Player } from "../types";

export default function getPlayer(state:GameState, playerId:number) : Player {
    const player = state.players.find(player=>player.id===playerId)
    if(!player){
        throw new Error(`Player ${playerId} not found`)
    }
    return player
}