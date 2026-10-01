import {  useState } from "react";
import { type ReactNode } from "react";
import { GameContext } from "./GameContext";
import type { Card, GameState,  } from "../types";
import createGame from "../gameLogic/createGame";
import makeMove from "../gameLogic/makeMove";
import makePass from "../gameLogic/makePass";

export const GameContextProvider = ({ children } : { children: ReactNode})=>{
    const [numberOfPlayers, setNumberOfPlayers] = useState<number | null>(null)
    const [playerName, setPlayerName] = useState<string | null>(null)
    
    const [game, setGame]= useState<GameState | null >(null)

    const startGame = (numberOfPlayers:number, playerName:string)=>{
        setNumberOfPlayers(numberOfPlayers)
        setPlayerName(playerName)
        setGame(createGame(numberOfPlayers,playerName))
    }
    const applyMove = (card:Card)=>{
        if(!game) return false
        console.log(`Applying move with a ${card} card`)
        const newState = makeMove(game,card)
        setGame(newState)
        console.log("State was updated.")
    }

    const applyPass = ()=>{
        if(!game) return false
        console.log("Applying pass")
        const newState = makePass(game)
        setGame(newState)
        console.log("State was updated.")
    }

    


    const contextValue = {
        numberOfPlayers,
        playerName,
        game,
        startGame,
        applyMove,
        applyPass
    }
    return(
        <GameContext.Provider value = {contextValue}>
            {children}
        </GameContext.Provider>
    )
}


