import type { Card } from "./card.types";
import type { Deck } from "./deck.types";
import type { DeckCard } from "./deckcard.types";
import type { Player } from "./player.types"

export type GameState = {
    players: Player[];
    deck:Deck;
    currentCards: DeckCard[]
    attackerId:number;
    defenderId:number;
    currentId:number;
    leftovers:Card[];
    movesCounter:number;
}