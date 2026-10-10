
import type { Card, GameState } from "../types/index.ts";
import getPlayer from "../utils/getPlayer.ts";
import checkValidCard from "./checkValidCard.ts";

export default function botFindValidCard(state: GameState) : Card{
  const moveType = state.currentId === state.attackerId ? "attack" : "defence";
  const playersCopy = structuredClone(state.players);
  const currentPlayer = getPlayer(playersCopy, state.currentId);
  console.log(currentPlayer)
  const validCards = currentPlayer.cards
  .map((card) => checkValidCard(card.id, state, moveType)) // Отримуємо об'єкти { isValid, card }
  .filter((result) => result.isCardValid && result.card)                     // Залишаємо тільки ті, де isValid === true
  .map((result) => result.card!);
  console.log(validCards)
  validCards.sort((a,b)=>a.value-b.value)
  
  return validCards[0]

}
