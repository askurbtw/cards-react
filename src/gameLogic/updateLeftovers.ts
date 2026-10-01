import type { Card, DeckCard } from "../types";

export default function updateLeftovers(cards:DeckCard[], stateLeftovers:Card[]) : Card[] {
    const leftovers = structuredClone(stateLeftovers)
    cards.forEach(card => {
        leftovers.push(card.card)
    });
    return leftovers
}