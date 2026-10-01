import type { Card } from "../types";

interface CardsContainerComponentProps{
    index: number;
    attackCard: Card | null;
    defenceCard : Card | null;
}

export default function CardsContainerComponent({index,attackCard,defenceCard}: CardsContainerComponentProps) {
    return(
        <div id = {`cards-${index}`}>
            {attackCard && <div >
                <img src={`/images/cards/${attackCard.value}_of_${attackCard.suit}.svg`} alt="" className = "attack-card" />
                </div>}
            {defenceCard && <div >
                <img src={`/images/cards/${defenceCard.value}_of_${defenceCard.suit}.svg`} alt="" className = "defence-card"/>
                </div>}
        </div>
    )
}