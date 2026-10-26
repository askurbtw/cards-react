
import type { Card } from "./card.types.ts";
import type { GameView } from "./gameView.types.ts";



export interface GameContextType {
    numberOfPlayers: number | null;
    playerName:string | null;
    game: GameView | null;
    startGame: (numberOfPlayers: number, playerName: string) => Promise<string>;
    joinGame: (playerName:string, roomID:string) => Promise<string>;
    applyMove: ( card:Card) => string;
    applyPass: () => string;
    token:string | null;
    myPlayerId:number| null;
    
    rejoin: (roomID:string, token:string)=>void;
    
    
    
}