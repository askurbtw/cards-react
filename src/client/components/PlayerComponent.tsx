import type React from "react"
import type {  Card, Player } from "@shared/types"
import { CardComponent } from "./CardComponent"
import { useRef, useState } from "react";
import { useGame } from "../context/GameContext";



interface PlayerComponentProps {
    playerInfo: Player
}


export default function PlayerComponent({ playerInfo }: PlayerComponentProps) {
    const [invalidCardId, setInvalidCardId] = useState<string | null>(null)
    const {game, applyMove, applyPass } = useGame()
    const cardEls = useRef(new Map<string, HTMLLIElement>()).current;
    const count = playerInfo.cards.length
    const handleClick = async (card:Card, cardRef:HTMLLIElement | undefined)=>{
        if(game?.currentId === playerInfo.id && cardRef){
            const result = await applyMove(card)
            if(result === 'Invalid move.'){
                setInvalidCardId(card.id)
                setTimeout(() => {
                    setInvalidCardId(null)
                }, 400);
            }
        }
        else{
            return
        }
    }
    const handlePass = ()=>{
        if(playerInfo.id===0){
            if(game){
                applyPass()
            }
        }
    }

    return (
        <div id={`player-${playerInfo.id+1}`} className="hand">
            <ul style={{ '--count': count } as React.CSSProperties}>
                {playerInfo.cards.map((card, index) => {
                    return (
                        <CardComponent key={`${playerInfo.id} - ${index}`} card={card} index={index} onClick = {playerInfo.id===0?()=>handleClick(card,cardEls.get(card.id)):undefined} playerIndex={playerInfo.id} isInvalid={card.id===invalidCardId?true:null}  ref={(node) => {
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
            {playerInfo.id === 0 && <button id="pass-btn" onClick={handlePass} className={game?.disablePassButton?`hidden`:undefined}>Pass</button>}
        </div>
    )


}