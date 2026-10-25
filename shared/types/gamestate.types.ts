import type { Card } from "./card.types.ts";
import type { Deck } from "./deck.types.ts";
import type { DeckCard } from "./deckcard.types.ts";
import type { Player } from "./player.types.ts";

export type GameState = {
  numberOfPlayers:number,
  players: Player[];
  deck: Deck;
  playersOnline: number,
  currentCards: DeckCard[];
  attackerId: number ;
  defenderId: number ;
  currentId: number ;
  leftovers: Card[];
  movesCounter: number;
  disablePassButton: boolean;
  status: "playing" | "finished" | "waiting for players";
  finishOrder: number[];
};
