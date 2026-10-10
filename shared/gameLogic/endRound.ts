import type { GameState } from "../types/index.ts";

import addCards from "./addCards.ts";
import findNextPlayers from "./findNextPlayers.ts";
import tableToDefender from "./tableToDefender.ts";
import tableToLeftovers from "./tableToLeftovers.ts";
import updateFinishOrder from "./updateFinishOrder.ts";

export default function endRound(state:GameState, deffPass:boolean) : GameState {
    const newStateFunction = deffPass?()=>tableToDefender(state):()=>tableToLeftovers(state)
    let newState = newStateFunction()
    newState = addCards(newState)
    newState = updateFinishOrder(newState)
    const nextAtkIndex = deffPass?state.attackerId+2:state.attackerId+1;
    const playersCopy = structuredClone(state.players)

    const [nextAttackerId, nextDefenderId] = findNextPlayers(playersCopy, nextAtkIndex)
    return {
        ...newState,
        attackerId:nextAttackerId,
        defenderId:nextDefenderId,
        currentId:nextAttackerId,
        movesCounter:1,
        disablePassButton:true
    }
    
}