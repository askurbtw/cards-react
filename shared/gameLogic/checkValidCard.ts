import type {  Card, GameState } from "../types/index.ts";


export default function checkValidCard(
  cardIdToCheck: string,
  state: GameState,
  moveType: string,
  
) : {isCardValid : boolean, card:Card | null}{
  const player = state.players[state.currentId]
  const cardToCheck = player.cards.find((card)=>card.id === cardIdToCheck)
  const currentCards = state.currentCards
  const trumpCard = state.deck.trump
  const movesCounter = state.movesCounter
  if (cardToCheck && currentCards && moveType && trumpCard) {
    if (moveType === "attack") {
      if (
        !currentCards.some((card) => card.card.value === cardToCheck.value) &&
        movesCounter !== 1
      ) {
        return {isCardValid: false, card: null};
      }
      if (
        movesCounter === 1 ||
        currentCards.some((card) => card.card.value === cardToCheck.value)
      ) {
        return {isCardValid: true, card: cardToCheck};
      }
    }
    if (moveType === "defence") {
      const currentCard = currentCards[currentCards.length - 1];
      
      const isValidMove =
        (cardToCheck.value > currentCard.card.value &&
          cardToCheck.suit === currentCard.card.suit) ||
        (cardToCheck.suit === trumpCard.suit &&
          currentCard.card.suit !== trumpCard.suit);

      if (isValidMove) {
        return  {isCardValid: true, card: cardToCheck};
      }
      return {isCardValid: false, card: null};
    }
    return {isCardValid: false, card: null};
  }
  return {isCardValid: false, card: null}
}
