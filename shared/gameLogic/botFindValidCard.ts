import type { Card, GameState } from "../types";
import getPlayer from "../utils/getPlayer";
import checkValidCard from "./checkValidCard";

export default function botFindValidCard(state: GameState) : Card{
  const moveType = state.currentId === state.attackerId ? "attack" : "defence";
  const playersCopy = structuredClone(state.players);
  const currentPlayer = getPlayer(playersCopy, state.currentId);
  console.log(currentPlayer)
  const validCards = currentPlayer.cards.filter((card) => 
    checkValidCard(
      card,
      state.currentCards,
      moveType,
      state.movesCounter,
      state.deck.trump,
    )
  );
  console.log(validCards)
  validCards.sort((a,b)=>a.value-b.value)
  
  return validCards[0]

}
