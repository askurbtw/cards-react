import type React from "react"
import type {  Player } from "../types"
import { CardComponent } from "./CardComponent"
import { useRef } from "react";


interface PlayerComponentProps {
    playerInfo: Player
}


export default function PlayerComponent({ playerInfo }: PlayerComponentProps) {
    
    
    const cardEls = useRef(new Map<string, HTMLLIElement>()).current;
    const count = playerInfo.cards.length
    

    return (
        <div id={`player-${playerInfo.id}`} className="hand">
            <ul style={{ '--count': count } as React.CSSProperties}>
                {playerInfo.cards.map((card, index) => {
                    return (
                        <CardComponent key={`${card.value} - ${card.suit}`} card={card} index={index}  ref={(node) => {
                            if (node) {
                                cardEls.set(card.id, node)
                            }
                            else {
                                cardEls.delete(card.id)
                            }
                        }} />
                    )
                })}
            </ul>
            {playerInfo.id === 1 && <button id="pass-btn" className="hidden">Pass</button>}
        </div>
    )


}