import type { Card } from "./card.types.js";
import type { Deck } from "./deck.types.js";
import type { DeckCard } from "./deckcard.types.js";
import type { Player } from "./player.types.js";

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
  finishOrder: {playerIngameId:number,playerUUID:string}[];
  isSinglePlayer :boolean;
};
