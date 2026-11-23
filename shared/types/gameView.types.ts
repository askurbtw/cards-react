import type { Deck } from "./deck.types.js";
import type { DeckCard } from "./deckcard.types.js";
import type { Player } from "./player.types.js";

export type GameView = {
    numberOfPlayers:number,
    roomId:string,
    players:Player[],
    playersOnline:number,
    deck:Deck,
    currentCards:DeckCard[];
    attackerId: number | undefined;
  defenderId: number | undefined;
  currentId: number | undefined;
    leftovers:number,
    disablePassButton: boolean,
    status: "playing" | "finished" | "waiting for players",
    finishOrder: number[],
    

}