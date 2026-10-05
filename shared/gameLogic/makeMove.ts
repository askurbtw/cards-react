import type { Card, GameState } from "../types";
import getPlayer from "../utils/getPlayer";

export default function makeMove(
  state: GameState,
  card: Card
  
): GameState | null {
  if(state.status==='finished') return null
  let moveNumber = state.movesCounter
  const playersCopy = structuredClone(state.players);
  const currentCardsCopy = structuredClone(state.currentCards);
  const currentPlayer = getPlayer(playersCopy, state.currentId);
  let nextPlayerId;
  const moveType = state.currentId === state.attackerId ? "attack" : "defence";

  if (moveType === "attack") {
    currentPlayer.cards = currentPlayer.cards.filter((playerCard) => {
      return playerCard.id != card.id;
    });
    console.log(card)
    const cardToDeck = { card, moveType, moveNumber   };
    console.log(cardToDeck)
    currentCardsCopy.push(cardToDeck);
    nextPlayerId = state.defenderId;
  } else {
    currentPlayer.cards = currentPlayer.cards.filter((playerCard) => {
      return playerCard.id != card.id;
    });
    const cardToDeck = { card, moveType, moveNumber };
    currentCardsCopy.push(cardToDeck);
    nextPlayerId = state.attackerId;
    moveNumber++;
  }
  

  
  

  return {
    ...state,
    players:playersCopy,
    currentCards:currentCardsCopy,
    movesCounter:moveNumber,
    currentId:nextPlayerId,
    disablePassButton: nextPlayerId===0?false:true
  };
}
