import type { GameState } from "../types/index.ts";

export default function addCards(state: GameState): GameState {
  if (state.deck.cards.length > 0) {
    const deckCopy = structuredClone(state.deck);
    const playersCopy = structuredClone(state.players);
    playersCopy.forEach((player) => {
      for (let i = player.cards.length; i < 6; i++) {
        if (deckCopy.cards.length > 0) {
          const deckCard = deckCopy.cards.pop();
          if (deckCard) player.cards.push(deckCard);
        } else {
          break;
        }
      }
    });
    return{
        ...state,
        deck:deckCopy,
        players:playersCopy
    }
  }
  return state;
}
