import type { Deck } from "../types";
import React from "react";

export function DeckComponent(props:{deck:Deck}){
    const numberOfCardsToAdd = Math.min(props.deck.cards.length,9)
    const cardsToAdd : string[]=[]
    for(let i=0;i<numberOfCardsToAdd;i++){
        cardsToAdd.push(`/images/cards/reverse_card.svg`)
    }
    return(
        <div className="deck">
            <div>
                <img src={`/images/cards/${props.deck.trump?.value}_of_${props.deck.trump?.suit}.svg`} alt="" />

            </div>
            {cardsToAdd.map((cardUrl,index)=>(
                <div className="deck-card" key={`${index} `} style={{'--i':index} as React.CSSProperties}>
                    <img src={`${cardUrl}`} alt="" />
                </div>
            ))}
        </div>
    )
}