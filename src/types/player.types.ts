import {type Card} from "./card.types";

export  interface Player{
    id:number;
    name:string;
    cards:Card[];
    isOutOfCards:boolean;
}