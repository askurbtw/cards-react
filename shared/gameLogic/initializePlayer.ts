import {  type Player } from "../types/index.ts";


export function initializePlayer(playerName:string, currentNumberOfPlayers:number): Player{
    const orderId = currentNumberOfPlayers
    const player : Player= {
        id:orderId,
        name:playerName,
        cards:[],
        isOutOfCards:false
    }
    return player

}