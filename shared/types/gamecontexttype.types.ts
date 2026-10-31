
import type { GameView } from "./gameView.types.ts";



export interface GameContextType {
    numberOfPlayers: number | null;
    playerName:string | null;
    game: GameView | null;
    startGame: (numberOfPlayers: number, playerName: string, gameType:'s' | 'm') => Promise<string>;
    joinGame: (playerName: string, roomID: string, gameType: 's' | 'm') => Promise<string>;
    applyMove: (cardID:string) => Promise<string>;
    applyPass: () => string;
    token:string | null;
    myPlayerId:number| null;
    
    rejoin: (roomID:string, token:string)=>void;
    
    
    
}