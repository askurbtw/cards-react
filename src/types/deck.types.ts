import {type Card} from "./card.types";
export interface Deck{
    numberOfCards:number;
    cards: Card[];
    trump:Card | null;
}
