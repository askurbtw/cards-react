import {type Card} from "./card.types.ts";
export interface Deck{
    cards: Card[];
    trump:Card | null;
}
