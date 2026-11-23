import type { GameState } from "../types/index.js";

import addCards from "./addCards.js";
import findNextPlayers from "./findNextPlayers.js";
import tableToDefender from "./tableToDefender.js";
import tableToLeftovers from "./tableToLeftovers.js";
import updateFinishOrder from "./updateFinishOrder.js";

export default function endRound(state:GameState, deffPass:boolean) : GameState {
    const newStateFunction = deffPass?()=>tableToDefender(state):()=>tableToLeftovers(state)
    let newState = newStateFunction()
    newState = addCards(newState)
    newState = updateFinishOrder(newState)
    const nextAtkIndex = deffPass?state.defenderId+1:state.attackerId+1;
    const [nextAttackerId, nextDefenderId] = findNextPlayers(newState, nextAtkIndex)
    return {
        ...newState,
        attackerId:nextAttackerId,
        defenderId:nextDefenderId,
        currentId:nextAttackerId,
        movesCounter:1,
        disablePassButton:true
    }
    
}