export const ALL_SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
export const ALL_VALUES = [6, 7, 8, 9, 10, 11, 12, 13, 14] as const;

export type Suit = typeof ALL_SUITS[number];   
export type CardValues = typeof ALL_VALUES[number]; 


export interface Card{
    id:string;
    value: number;
    suit:string;
    
}