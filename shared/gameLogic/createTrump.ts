import type { Card } from "../types/index.js";

export default function createTrump(cards:Card[]): Card | null{
    if (!cards || cards.length === 0) {
    return null;
    }
    const trumpCard = cards[0]
    return trumpCard
}