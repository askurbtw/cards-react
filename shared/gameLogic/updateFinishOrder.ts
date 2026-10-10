import type { GameState } from "../types/index.ts";

export default function updateFinishOrder(state:GameState) : GameState {
    if (state.deck.cards.length > 0) return state
    const playersCopy = structuredClone(state.players)
    const finishOrder = [...state.finishOrder]
    playersCopy.forEach(player => {
        if(player.isOutOfCards===false && player.cards.length===0){
            player.isOutOfCards=true
            finishOrder.push(player.id)
        }
    });
    if(finishOrder.length>=playersCopy.length-1){
        const lastPlayer = playersCopy.find(player=>player.isOutOfCards===false)
        if(lastPlayer)
        finishOrder.push(lastPlayer.id)
        return {
        ...state,
        players:playersCopy,
        finishOrder,
        status: "finished" as const
    }
}
    
    
    return {
        ...state,
        players:playersCopy,
        finishOrder
    }
}