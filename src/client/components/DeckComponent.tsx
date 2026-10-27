import type { Deck } from "@shared/types";
import React from "react";

export function DeckComponent(props: { deck: Deck }) {
    const cardURL = `/images/cards/reverse_card.svg`
    return (
        <div id="deck">
            <div className={props.deck.cards.length===0?'last':undefined}>
                <img src={`/images/cards/${props.deck.trump?.value}_of_${props.deck.trump?.suit}.svg`} alt="" />
            </div>
            {props.deck.cards.map((_, index) => {
                const i = index>8 ? 9 : index
                return (
                    <div className="deck-card" key={`${index} `} style={{ '--i': i } as React.CSSProperties}>
                        <img src={`${cardURL}`} alt="" />
                    </div>

                )
            })}
        </div>
    )
}