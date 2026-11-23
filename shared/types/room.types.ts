import type { GameState } from "./gamestate.types.js";


export interface Room {
    roomId: string;
    state: GameState,
    tokens: Map<string,number>,
    sockets: Map<string,string>
}
