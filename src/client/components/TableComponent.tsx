import type { Deck, DeckCard } from "@shared/types"
import { useMemo } from "react";
import CardsContainerComponent from "./CardsContainerComponent";
import { DeckComponent } from "./DeckComponent";
import React from "react";
interface TableComponentProps {
    deck: Deck;
    text: string;
    currentCards: DeckCard[];
    leftovers: number,
    status: "playing" | "finished" | "waiting for players",
    roomId: string
}


export default function TableComponent({ deck, text, currentCards, leftovers, status, roomId }: TableComponentProps) {
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
    const handleCopy = async (textToCopy: string) => {
        try {
            await navigator.clipboard.writeText(textToCopy)
            alert(`Coppied succesfully. Share is with your friends!`)
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            console.error("Couldn't copy to clipboard:", err.message, { cause: err });
        }
    }
    return (
        <div id="cards-field">
            <div id="field">
                <div id="game-text">
                    <h2>{text}</h2>
                </div>
                {status === 'waiting for players' ? <div id='room-id'>
                    <h4>Share it with your friends!</h4>
                    <div id='room-id-plus-button'><h3>{roomId}</h3>
                        <button onClick={() => handleCopy(roomId)}>Copy</button></div>
                </div> : undefined}
                <div id="game-field">
                    <div id="cards-part-of-field">
                        {pairedMoves.map((cards) => {
                            return <CardsContainerComponent index={cards.moveNumber} key={`${cards.moveNumber} ${cards.attackCard}_${cards.defenceCard}`} attackCard={cards.attackCard} defenceCard={cards.defenceCard} />
                        })}
                    </div>
                    <div id="deck-part-of-field">
                        <DeckComponent deck={deck} />
                        <div id="leftovers" className="black-transparent">
                            {[...Array(leftovers)].slice(0,8).map((_, index) => {
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