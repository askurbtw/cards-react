import type { GameState } from "../types/index.js";
import updateLeftovers from "./updateLeftovers.js";

export default function tableToLeftovers(state:GameState) :GameState {
    const currentCardsCopy = structuredClone(state.currentCards)
    const currentCards = currentCardsCopy.splice(0);
    const leftovers = updateLeftovers(currentCards, state.leftovers)
    return{
        ...state,
        currentCards:currentCardsCopy,
        leftovers
    }
}