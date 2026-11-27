import {type Card} from "./card.types.js";

export  interface Player{
    uuid:string,
    id:number;
    name:string;
    cards:Card[];
    isOutOfCards:boolean;
}