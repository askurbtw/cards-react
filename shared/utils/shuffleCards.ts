import type { Card } from "../types/index.ts";

export default function shuffleCards(deck:Card[]){
    const cardsCopy = [...deck]
    for (let i = cardsCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardsCopy[i], cardsCopy[j]] = [cardsCopy[j], cardsCopy[i]];
    }
    
    return cardsCopy
    
}