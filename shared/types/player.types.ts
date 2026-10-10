import {type Card} from "./card.types.ts";

export  interface Player{
    id:number;
    name:string;
    cards:Card[];
    isOutOfCards:boolean;
}