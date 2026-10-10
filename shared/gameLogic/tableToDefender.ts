import type { GameState } from "../types/index.ts";
import getPlayer from "../utils/getPlayer.ts";

export default function tableToDefender(state:GameState) :GameState {
        const playersCopy = structuredClone(state.players);
        const currentPlayer = getPlayer(playersCopy, state.currentId);
        const currentCardsCopy = structuredClone(state.currentCards);
        const currentCards = currentCardsCopy.splice(0);
        currentPlayer.cards.push(...currentCards.map((card) => card.card));
        return{
            ...state,
            players:playersCopy,
            currentCards:currentCardsCopy
        }
}