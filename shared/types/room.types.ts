import type { GameState } from "./gamestate.types.ts";
import type { Player } from "./player.types.ts";


export interface Room {
    roomId: string;
    state: GameState,
    tokens: Map<string,number>,
    sockets: Map<string,Player>
}
