
import type {  Deck, Player } from "../types/index.js";


export function initializePlayerCard(deck: Deck, player: Player) {
  
  const pickedCard = deck.cards.pop();
  if (pickedCard) {
    player.cards.push(pickedCard);
  }
  
}
