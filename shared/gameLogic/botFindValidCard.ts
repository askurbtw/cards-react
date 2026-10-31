
import type { Card, GameState } from "../types/index.ts";
import getPlayer from "../utils/getPlayer.ts";
import checkValidCard from "./checkValidCard.ts";

export default function botFindValidCard(state: GameState) : Card{
  const moveType = state.currentId === state.attackerId ? "attack" : "defence";
  const playersCopy = structuredClone(state.players);
  const currentPlayer = getPlayer(playersCopy, state.currentId);
  
  const validCards = currentPlayer.cards
  .map((card) => checkValidCard(card.id, state, moveType)) 
  .filter((result) => result.isCardValid && result.card)                     
  .map((result) => result.card!);
  
  
  validCards.sort((a,b)=>a.value-b.value)
  if(state.deck.trump){
    const trumpCard = state.deck.trump
    const nonTrumpCard = validCards.find(card=>card.suit!==trumpCard.suit) 
    if(nonTrumpCard) return nonTrumpCard
  }
  return validCards[0]

}
