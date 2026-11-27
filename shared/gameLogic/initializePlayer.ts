import {  type Player } from "../types/index.js";


export function initializePlayer(playerName:string, playerUUID:string, currentNumberOfPlayers:number): Player{
    const orderId = currentNumberOfPlayers
    const player : Player= {
        uuid: playerUUID,
        id:orderId,
        name:playerName,
        cards:[],
        isOutOfCards:false
    }
    return player

}