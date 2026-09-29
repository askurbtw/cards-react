
import {type Card, type Deck, ALL_SUITS, ALL_VALUES} from '../types'
import shuffleCards from '../utils/shuffleCards';
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
    const shuffledCards = shuffleCards(cards)
    const trump = createTrump(shuffledCards)
    const deck: Deck = {
        cards:shuffledCards,
        trump
    }
    
    
    return deck
}