import type React from "react"
import type {  Card, Player } from "../types"
import { CardComponent } from "./CardComponent"
import { useRef, useState } from "react";
import { useGame } from "../context/GameContext";
import checkValidCard from "../gameLogic/checkValidCard";


interface PlayerComponentProps {
    playerInfo: Player
}


export default function PlayerComponent({ playerInfo }: PlayerComponentProps) {
    const [invalidCardId, setInvalidCardId] = useState<string | null>(null)
    const {game} = useGame()
    const cardEls = useRef(new Map<string, HTMLLIElement>()).current;
    const count = playerInfo.cards.length
    const handleClick = (card:Card, cardRef:HTMLLIElement | undefined)=>{
        if(game?.currentId === playerInfo.id && cardRef){
            const moveType = game.attackerId === playerInfo.id?"attack":"defence"
            if(checkValidCard(card,game.currentCards,moveType,game.movesCounter,game.deck.trump)){
                console.log("Valid")
            }
            else{
                console.log("Card is invalid.")
                setInvalidCardId(card.id)

            }
        }
        else{
            return
        }
    }

    return (
        <div id={`player-${playerInfo.id}`} className="hand">
            <ul style={{ '--count': count } as React.CSSProperties}>
                {playerInfo.cards.map((card, index) => {
                    return (
                        <CardComponent key={`${card.value} - ${card.suit}`} card={card} index={index} onClick = {playerInfo.id===1?()=>handleClick(card,cardEls.get(card.id)):undefined} playerIndex={playerInfo.id} isInvalid={card.id===invalidCardId?true:null}  ref={(node) => {
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