import { useState } from "react";
import { type ReactNode } from "react";
import { GameContext } from "./GameContext";
import type { GameState,  } from "../types";
import createGame from "../gameLogic/createGame";

export const GameContextProvider = ({ children } : { children: ReactNode})=>{
    const [numberOfPlayers, setNumberOfPlayers] = useState<number | null>(null)
    const [playerName, setPlayerName] = useState<string | null>(null)
    const [game, setGame]= useState<GameState | null >(null)

    const startGame = (numberOfPlayers:number, playerName:string)=>{
        setNumberOfPlayers(numberOfPlayers)
        setPlayerName(playerName)
        setGame(createGame(numberOfPlayers,playerName))
    }

    


    const contextValue = {
        numberOfPlayers,
        playerName,
        game,
        startGame
    }
    return(
        <GameContext.Provider value = {contextValue}>
            {children}
        </GameContext.Provider>
    )
}


