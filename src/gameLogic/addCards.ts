import type { Deck, Player } from "../types";

export default function addCards(deck:Deck,player:Player) {
    if(deck.cards.length>0){
        const newCard = deck.cards.pop()
        if(newCard){
        player.cards.push(newCard)
        }
    }
}