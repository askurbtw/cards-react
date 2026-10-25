import type { Card } from "./card.types.ts";
import type { GameView } from "./gameView.types.ts";



export interface GameContextType {
    numberOfPlayers: number | null;
    playerName:string | null;
    game: GameView | null;
    startGame: (numberOfPlayers: number, playerName: string) => Promise<string>;
    joinGame: (playerName:string, roomID:string) => Promise<string>;
    applyMove: ( card:Card) => Promise<string>;
    applyPass: () => Promise<string>;
    token:string;
    myPlayerId:number
    
    
}