import type { GameState } from "../types";

import endRound from "./endRound";


export default function makePass(state: GameState): GameState | null {
    if(state.status==='finished') return null
  if (state.currentId === state.defenderId) {
    return endRound(state,true)
  }
  if (state.currentId === state.attackerId) {
    return endRound(state,false)
  }
  return state

}
