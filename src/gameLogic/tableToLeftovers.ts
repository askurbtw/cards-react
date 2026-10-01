import type { GameState } from "../types";
import updateLeftovers from "./updateLeftovers";

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