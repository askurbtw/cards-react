import type React from "react"
import type {  Card, Player } from "@shared/types"
import { CardComponent } from "./CardComponent"
import { useRef, useState } from "react";
import { useGame } from "../context/GameContext";



interface PlayerComponentProps {
    index:number,
    playerInfo: Player
}


export default function PlayerComponent({ index,playerInfo }: PlayerComponentProps) {
    const [invalidCardId, setInvalidCardId] = useState<string | null>(null)
    const {game, applyMove, applyPass, myPlayerId } = useGame()
    const cardEls = useRef(new Map<string, HTMLLIElement>()).current;
    const count = playerInfo.cards.length
    const handleClick = async (card:Card, cardRef:HTMLLIElement | undefined)=>{
        if(game?.status==='waiting for players') return
        if(game?.currentId === playerInfo.id && cardRef){
            const result = applyMove(card)
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
        if(playerInfo.id===myPlayerId){
            if(game){
                applyPass()
            }
        }
    }

    return (
        <div id={`player-${index+1}`} className="hand">
            <h6>{playerInfo.name}</h6>
            <ul style={{ '--count': count } as React.CSSProperties}>
                {playerInfo.cards.map((card, index) => {
                    return (
                        <CardComponent key={`${playerInfo.id} - ${index}`} card={card} index={index} onClick = {playerInfo.id===myPlayerId?()=>handleClick(card,cardEls.get(card.id)):undefined} playerIndex={playerInfo.id} isInvalid={card.id===invalidCardId?true:null}  ref={(node) => {
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
            {playerInfo.id === myPlayerId && <button id="pass-btn" onClick={handlePass} className={game?.disablePassButton?`hidden`:undefined}>Pass</button>}
        </div>
    )


}