import {type Card} from "./card.types";

export  interface Player{
    id:string;
    name:string;
    cards:Card[];
    isOutOfCards:boolean;
}