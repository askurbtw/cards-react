import type { Card, DeckCard } from "../types";

export default function updateLeftovers(cards:DeckCard[]) : Card[] {
    const leftovers : Card[] = []
    cards.forEach(card => {
        leftovers.push(card.card)
    });
    return leftovers
}