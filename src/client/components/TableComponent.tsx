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
        const map = new Map<number, { attackCard: DeckCard | null, defenceCard: DeckCard | null }>()
        currentCards.forEach((card) => {
            const { moveType, moveNumber } = card
            if (!map.has(moveNumber)) {
                map.set(moveNumber, { attackCard: null, defenceCard: null })
            }
            const pair = map.get(moveNumber)
            if (pair) {
                if (moveType === "attack") {
                    pair.attackCard = {card: card.card,
                        moveType,moveNumber} 
                }
                if (moveType === "defence") {
                    pair.defenceCard = {card: card.card,
                        moveType,moveNumber} 
                }
            }

        })
        return map
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
                        {Array.from({length:6},(_,index)=>{
                            return index+1
                        }).map((index) => {
                            return <CardsContainerComponent index={index} key={`${index} ${pairedMoves.get(index)?.attackCard}_${pairedMoves.get(index)?.defenceCard}`} attackCard={pairedMoves.get(index)?.attackCard?.card} defenceCard={pairedMoves.get(index)?.defenceCard?.card} />
                        })}
                    </div>
                    <div id="deck-part-of-field">
                        <DeckComponent deck={deck} />
                        <div id="leftovers" className="black-transparent">
                            {[...Array(leftovers)].slice(0, 8).map((_, index) => {
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