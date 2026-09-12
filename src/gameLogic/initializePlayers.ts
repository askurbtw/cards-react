import { type Deck, type Player } from "../types";
// import { initializeCard } from "./initializeCard";

export function initializePlayers(numberOfPlayers:number  , playerName:string, deck:Deck):Player[]{
    const players:Player[]=[]
    players.push({id:1,name:playerName,cards:[],isOutOfCards:false})
    for(let i=2;i<=numberOfPlayers;i++){
        players.push({id:i,name:`Bot#${i}`, cards:[],isOutOfCards:false})
    }
    if(players.length!==0){
        for(let i=0;i<numberOfPlayers*6;i++){
            // const pickedCard = initializeCard(deck.cards.pop(),players[i%numberOfPlayers])
            const pickedCard = deck.cards.pop()
            if(pickedCard){
            players[i%numberOfPlayers].cards.push(pickedCard)
            } 
        }
    }
    
    return players

}