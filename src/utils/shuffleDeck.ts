import type { Deck } from "../types";

export default function shuffleDeck(deck:Deck){
    const cardsCopy = [...deck.cards]
    for (let i = cardsCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardsCopy[i], cardsCopy[j]] = [cardsCopy[j], cardsCopy[i]];
    }
    return {
        numberOfCards:cardsCopy.length,
        cards:cardsCopy,
        trump:deck.trump
    }
}