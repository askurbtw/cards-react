import type { Deck } from "@shared/types";
import React from "react";

export function DeckComponent(props: { deck: Deck }) {
    const cardURL = `/images/cards/reverse_card.svg`
    return (
        <div id="deck" className="black-transparent">
            <h5>{`${props.deck.cards.length} cards left.`}</h5>
            <div className={props.deck.cards.length === 0 ? 'last' : undefined}>
                <img src={`/images/cards/${props.deck.trump?.value}_of_${props.deck.trump?.suit}.svg`} alt="" />
            </div>
            {props.deck.cards.slice(1,9).map((_, index) => {
                
                return (
                    <div className="deck-card" key={`${index} `} style={{ '--i': index } as React.CSSProperties}>
                        <img src={`${cardURL}`} alt="" />
                    </div>

                )
            })}
        </div>
    )
}