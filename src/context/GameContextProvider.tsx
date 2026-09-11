import { useState } from "react";
import { type ReactNode } from "react";
import { GameContext } from "./GameContext";

export const GameContextProvider = ({ children } : { children: ReactNode})=>{
    const [numberOfPlayers, setNumberOfPlayers] = useState<number | null>(null)
    const [playerName, setPlayerName] = useState<string | null>(null)
    return(
        <GameContext.Provider value = {{numberOfPlayers, playerName,setNumberOfPlayers,setPlayerName}}>
            {children}
        </GameContext.Provider>
    )
}


