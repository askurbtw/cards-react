import type { GameState } from "../types";

import addCards from "./addCards";
import findNextPlayers from "./findNextPlayers";
import tableToDefender from "./tableToDefender";
import tableToLeftovers from "./tableToLeftovers";
import updateFinishOrder from "./updateFinishOrder";

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