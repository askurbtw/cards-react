import {type Card} from "./card.types.js";
export interface Deck{
    cards: Card[];
    trump:Card | null;
}
