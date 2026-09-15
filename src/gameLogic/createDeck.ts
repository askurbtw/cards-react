
import {type Card, type Deck, ALL_SUITS, ALL_VALUES} from '../types'
import shuffleDeck from '../utils/shuffleDeck';
import createTrump from './createTrump';

export default function createDeck(): Deck{
    const cards : Card[] = []
    let index :number = 0;

    for (const suit of ALL_SUITS) {
      for (const value of ALL_VALUES) {
        cards.push({id:String(index), value,suit})
        index++;
      }
    }
    const numberOfCards = cards.length
    const trump = createTrump(cards)
    const deck: Deck = {
        numberOfCards,
        cards,
        trump
    }
    shuffleDeck(deck)
    
    return deck
}