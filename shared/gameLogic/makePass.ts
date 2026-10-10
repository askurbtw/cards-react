import type { GameState } from "../types/index.ts";

import endRound from "./endRound.ts";


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
