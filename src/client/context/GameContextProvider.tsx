import { useState } from "react";
import { type ReactNode } from "react";
import { GameContext } from "./GameContext";
import type { Card, GameView  } from "@shared/types";
import customDelay from "@shared/utils/customDelay";



export const GameContextProvider = ({ children }: { children: ReactNode }) => {
    const [numberOfPlayers, setNumberOfPlayers] = useState<number | null>(null)
    const [playerName, setPlayerName] = useState<string | null>(null)
    const [game, setGame] = useState<GameView | null>(null)
    const [token, setToken] = useState<string>('')

    const startGame = async (numberOfPlayers: number, playerName: string): Promise<string> => {
        setNumberOfPlayers(numberOfPlayers)
        setPlayerName(playerName)
        const response = await fetch('/routes/create/room',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                numberOfPlayers,
                playerName
            })
        })
        if(!response.ok){
            throw new Error('Server error')
        }
        const data = await response.json();
        
        setGame(data.state)
        setToken(data.token)
        console.log(data)
        return data.roomId

    }
    const applyMove = async (card: Card) : Promise<string> => {
        if (!game) return 'Game is not defined.'
        const response = await fetch(`/routes/apply/move/${game.roomId}`,
            {
                method:'POST',
                headers:{
                    'Content-Type':'application/json',
                    Authorization: token
                },
                body:JSON.stringify({cardId:card.id})
            }
        )
        
        const rawString : string= await response.text()
        const data = JSON.parse(rawString)
        if(!response.ok){
            return data.error
        }
        const stateHistory : GameView [] = data.stateHistory
        console.log(stateHistory.length)
        for(let i = 0;i<stateHistory.length;i++){
            if(i>0){
                await customDelay(3000)
            }
            setGame(stateHistory[i])
        }
        
        return 'Success.'
    }

    const applyPass = async () => {
        if (!game) return 'Game is not defined.'
        const response = await fetch(`/routes/apply/pass/${game.roomId}`,
            {
                method:'POST',
                headers:{
                    'Content-Type':'application/json',
                    Authorization: token
                },
            }
        )
        const rawString : string= await response.text()
        const data = JSON.parse(rawString)
        if(!response.ok){
            return data.error
        }
        const stateHistory : GameView [] = data.stateHistory
        console.log(stateHistory.length)
        for(let i = 0;i<stateHistory.length;i++){
            if(i>0){
                await customDelay(3000)
            }
            setGame(stateHistory[i])
        }
        
        return 'Success.'
        
    }

    const contextValue = {
        numberOfPlayers,
        playerName,
        game,
        startGame,
        applyMove,
        applyPass,
        
    }
    return (
        <GameContext.Provider value={contextValue}>
            {children}
        </GameContext.Provider>
    )
}


