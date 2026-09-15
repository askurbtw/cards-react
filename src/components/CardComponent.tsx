import React, {  forwardRef } from "react";
import type { Card } from "../types";



interface CardProps {
  card: Card,
  index:number,
}

export const CardComponent = forwardRef<HTMLLIElement, CardProps>(
    function Card({card,index},ref) {
    return(
        <li ref={ref} style={{'--i':index} as React.CSSProperties} >
            <div className="the-card">
                <img src="/images/cards/reverse_card.svg" className="the-front" />
                <img src={`/images/cards/${card.value}_of_${card.suit}.svg`} className="the-back"  />
            </div>
        </li>
    )
}
)