import type { Card } from "@shared/types";

interface CardsContainerComponentProps{
    index: number;
    attackCard: Card | undefined;
    defenceCard : Card | undefined;
}

export default function CardsContainerComponent({index,attackCard,defenceCard}: CardsContainerComponentProps) {
    return(
        <div id = {`cards-${index}`} className="black-transparent">
            {attackCard && <div >
                <img src={`/images/cards/${attackCard.value}_of_${attackCard.suit}.svg`} alt="" className = "attack-card" />
                </div>}
            {defenceCard && <div >
                <img src={`/images/cards/${defenceCard.value}_of_${defenceCard.suit}.svg`} alt="" className = "defence-card"/>
                </div>}
        </div>
    )
}