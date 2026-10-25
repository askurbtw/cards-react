import { useEffect, useState } from "react";
import { type ReactNode } from "react";
import { GameContext } from "./GameContext";
import type { Card, GameView  } from "@shared/types";

import { useSocket } from "./SocketContext";
import type SocketResponse from "@shared/types/socketresponse.types";




export const GameContextProvider = ({ children }: { children: ReactNode }) => {
    const [numberOfPlayers, setNumberOfPlayers] = useState<number | null>(null)
    const [playerName, setPlayerName] = useState<string | null>(null)
    const [game, setGame] = useState<GameView | null>(null)
    const [token, setToken] = useState<string>('')
    const [myPlayerId, setMyPlayerId] = useState<number>(0)
    const {socket, makeHandshake} = useSocket()


    useEffect(()=>{
        if(!socket) return
        socket.on("broadcast", (newState: GameView)=>{
            console.log("player joined")
            
            const players = [...newState.players.slice(myPlayerId), ...newState.players.slice(0,myPlayerId)]
            newState.players=players
            setMyPlayerId(players[0].id)
            console.log(newState)
            setGame(newState)
        })
        socket.on("update_game", (newState: GameView)=>{
            console.log("player joined")
            console.log(newState)
            setGame(newState)
        })

        
    },[socket, myPlayerId])
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
        makeHandshake(data.roomId)
        setGame(data.state)
        setToken(data.token)
        setMyPlayerId(data.state.players[data.state.players.length-1].id)
        console.log(data)
        
        return data.roomId

    }
    const joinGame = async (playerName: string,roomID:string): Promise<string> => {
        setNumberOfPlayers(numberOfPlayers)
        setPlayerName(playerName)
        const response = await fetch(`/routes/join/room/${roomID}`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                playerName
            })
        })
        if(!response.ok){
            throw new Error('Server error')
        }
        const data = await response.json();
        makeHandshake(data.roomId)
        setGame(data.state)
        setToken(data.token)
        setMyPlayerId(data.state.players[data.state.players.length-1].id)
        console.log(data)
        return data.roomId

    }
    
    const applyMove =  (card: Card) : string => {
        if (!game || !socket) return 'Game or socket is not defined.'
        socket.emit("make_move", card.id, (response:SocketResponse)=>{
            if(response && response.error){
                console.log(response.error)
                return response.error
            }
        })
        
        return 'Success.'
    }

    const applyPass =  () : string=> {
        if (!game || !socket) return 'Game or socket is not defined.'
        socket.emit("make_pass", (response:SocketResponse)=>{
            if(response && response.error){
                console.log(response.error)
                return response.error
            }
        })
        return 'Success.'
        
    }

    const contextValue = {
        numberOfPlayers,
        playerName,
        game,
        startGame,
        joinGame,
        applyMove,
        applyPass,
        token,
        myPlayerId
        
    }
    return (
        <GameContext.Provider value={contextValue}>
            {children}
        </GameContext.Provider>
    )
}


