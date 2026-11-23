import {type Card} from "./card.types.js";

export  interface Player{
    id:number;
    name:string;
    cards:Card[];
    isOutOfCards:boolean;
}