import type { Card } from "./card.types";
import type { GameState } from "./gamestate.types";


export interface GameContextType {
    numberOfPlayers: number | null;
    playerName:string | null;
    game: GameState | null;
    startGame: (numberOfPlayers: number, playerName: string) => void;
    applyMove: ( card:Card) => void;
    applyPass: () => void;
    
    
}