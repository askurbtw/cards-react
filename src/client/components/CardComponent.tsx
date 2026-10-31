import React, {  forwardRef } from "react";
import type { Card } from "@shared/types";
import { useGame } from "../context/GameContext";



interface CardProps {
  card: Card,
  index:number,
  playerIndex:number,
  onClick:(()=>void) | undefined,
  isInvalid:boolean | null
}

export const CardComponent = forwardRef<HTMLLIElement, CardProps>(
    function Card({card,index, playerIndex, onClick,isInvalid},ref) {
        const {myPlayerId} = useGame()
    return(
        <li ref={ref} style={{'--i':index} as React.CSSProperties} >
            <div className={`the-card ${playerIndex===myPlayerId?"card-flipped":null}
                ${isInvalid?"invalid-card":null}`} onClick={onClick}>
                <img src="/images/cards/reverse_card.svg" className="the-front" />
                {playerIndex===myPlayerId &&<img src={`/images/cards/${card.value}_of_${card.suit}.svg`} className="the-back"  />}
            </div>
        </li>
    )
}
)