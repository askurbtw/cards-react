import type { GameState } from "./gamestate.types.ts";


export interface Room {
    roomId: string;
    state: GameState,
    tokens: Map<string,number>
}
