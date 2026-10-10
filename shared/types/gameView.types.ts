import type { Deck } from "./deck.types.ts";
import type { DeckCard } from "./deckcard.types.ts";
import type { Player } from "./player.types.ts";

export type GameView = {
    roomId:string,
    players:Player[],
    deck:Deck,
    currentCards:DeckCard[];
    attackerId: number;
  defenderId: number;
  currentId: number;
    leftovers:number,
    disablePassButton: boolean,
    status: "playing" | "finished",
    finishOrder: number[]

}