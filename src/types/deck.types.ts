import {type Card} from "./card.types";
export interface Deck{
    cards: Card[];
    trump:Card | null;
}
