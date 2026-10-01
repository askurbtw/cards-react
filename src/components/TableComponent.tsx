import type { Card, Deck, DeckCard } from "../types"
import { useMemo } from "react";
import CardsContainerComponent from "./CardsContainerComponent";
import { DeckComponent } from "./DeckComponent";
import React from "react";
interface TableComponentProps {
    deck: Deck;
    text: string;
    currentCards: DeckCard[];
    leftovers: Array<Card>
}


export default function TableComponent({ deck, text, currentCards, leftovers }: TableComponentProps) {
    const pairedMoves = useMemo(() => {
        const map = new Map()
        currentCards.forEach((card) => {
            const { moveType, moveNumber } = card
            if (!map.has(moveNumber)) {
                map.set(moveNumber, { moveNumber })
            }
            const pair = map.get(moveNumber)
            if (moveType === "attack") {
                pair.attackCard = card.card
            }
            if (moveType === "defence") {
                pair.defenceCard = card.card
            }

        })
        return Array.from(map.values()).sort((a, b) => a.moveNumber - b.moveNumber)
    }, [currentCards])

    return (
        <div id="cards-field">
            <div id="field">
                <div id="game-text">
                    {text}
                </div>
                <div id="game-field">
                    <div id="cards-part-of-field">
                        {pairedMoves.map((cards) => {
                            return <CardsContainerComponent  index={cards.moveNumber} key={`${cards.moveNumber} ${cards.attackCard}_${cards.defenceCard}`} attackCard={cards.attackCard} defenceCard={cards.defenceCard} />
                        })}
                    </div>
                    <div id="deck-part-of-field">
                        <DeckComponent deck={deck} />
                        <div id="leftovers">
                            {leftovers.map((_, index) => {
                                return <div className="deck-card" key={`${index} `} style={{ '--i': index } as React.CSSProperties}>
                                    <img src="/images/cards/reverse_card.svg" alt="" />
                                </div>
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}