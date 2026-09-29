import type { Card, DeckCard } from "../types";


export default function checkValidCard(
  cardToCheck: Card,
  currentCards: DeckCard[],
  moveType: string,
  movesCounter:number,
  trumpCard:Card |null
) {
  console.log(trumpCard)
  if (cardToCheck && currentCards && moveType && trumpCard) {
    if (moveType === "attack") {
      if (
        !currentCards.some((card) => card.card.value === cardToCheck.value) &&
        movesCounter !== 1
      ) {
        return false;
      }
      if (
        movesCounter === 1 ||
        currentCards.some((card) => card.card.value === cardToCheck.value)
      ) {
        return true;
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
        return true;
      }
      return false;
    }
    return false;
  }
}
