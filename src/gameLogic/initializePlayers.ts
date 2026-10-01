
import { type Deck, type Player } from "../types";
import { initializePlayerCard } from "./initializePlayerCard";



export function initializePlayers(numberOfPlayers:number  , playerName:string, deck:Deck):[Player[],Deck]{
    const players:Player[]=[]
    const deckCopy : Deck = {
        cards:structuredClone(deck.cards), trump:structuredClone(deck.trump)
    }

    players.push({id:0,name:playerName,cards:[],isOutOfCards:false})
    for(let i=1;i<numberOfPlayers;i++){
        players.push({id:i,name:`Bot#${i}`, cards:[],isOutOfCards:false})
    }
    
    if(players.length!==0){
        for(let i=0;i<numberOfPlayers*6;i++){
            initializePlayerCard(deckCopy,players[i%numberOfPlayers])
           
        }
    }
    console.log(players)
    console.log(deckCopy)
    
    
    return [players,deckCopy]

}