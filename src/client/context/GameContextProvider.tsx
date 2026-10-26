import {  useEffect, useState } from "react";
import { type ReactNode } from "react";
import { GameContext } from "./GameContext";
import type { Card, GameContextType, GameView } from "@shared/types";

import { useSocket } from "./SocketContext";
import type SocketResponse from "@shared/types/socketresponse.types";






export const GameContextProvider = ({ children }: { children: ReactNode }) => {
    const [numberOfPlayers, setNumberOfPlayers] = useState<number | null>(null)
    const [playerName, setPlayerName] = useState<string | null>(null)
    const [game, setGame] = useState<GameView | null>(null)

    const [myPlayerId, setMyPlayerId] = useState<number | null>(null)
    const { token, updateToken, socket, makeHandshake } = useSocket()

    useEffect(() => {
        if (!socket) {
            makeHandshake()
            return
        }
        console.log("loading listeners")
        socket.on("broadcast", (newState: GameView) => {
            console.log(newState)
            setGame(newState)
        })
        
    }, [makeHandshake, socket])
    const startGame = async (numberOfPlayers: number, playerName: string): Promise<string> => {
        if(!socket) return 'Socket error.'
        setNumberOfPlayers(numberOfPlayers)
        setPlayerName(playerName)
        const response = await fetch('/routes/create/room', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                numberOfPlayers,
                playerName
            })
        })
        if (!response.ok) {
            throw new Error('Server error')
        }

        const data = await response.json();
        socket.emit("join_room", data.roomId, (error:SocketResponse)=>{
            throw new Error(error.error)
            
        })
        const playerID = data.playerID
        setMyPlayerId(playerID)
        const players = [...data.state.players.slice(playerID), ...data.state.players.slice(0, playerID)]
        data.state.players = players
        setGame(data.state)
        updateToken(data.token)
        console.log(data)
        return data.roomId

    }
    const joinGame = async (playerName: string, roomID: string): Promise<string> => {
        if(!socket) return 'Socket error.'
        const response = await fetch(`/routes/join/room/${roomID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                playerName
            })
        })
        if (!response.ok) {
            throw new Error('Server error')
        }
        setPlayerName(playerName)
        const data = await response.json();
        socket.emit("join_room", roomID, (error:SocketResponse)=>{
            throw new Error(error.error)
            
        })
        const playerID = data.playerID
        setMyPlayerId(playerID)
        const players = [...data.state.players.slice(playerID), ...data.state.players.slice(0, playerID)]
        data.state.players = players
        setGame(data.state)
        updateToken(data.token)
        setNumberOfPlayers(data.state.numberOfPlayers)
        console.log(data)
        return data.roomId

    }

    const applyMove = (card: Card): string => {
        if (!game || !socket) return 'Game or socket is not defined.'
        socket.emit("make_move", card.id, (response: SocketResponse) => {
            if (response && response.error) {
                console.log(response.error)
                return response.error
            }
        })

        return 'Success.'
    }

    const applyPass = (): string => {
        let error:string = '';
        if (!game || !socket) return 'Game or socket is not defined.'
        socket.emit("make_pass", (response: SocketResponse) => {
            if (response && response.error) {
                console.log(response.error)
                error = response.error
            }
        })
        return error?error:'Success.'

    }
    const rejoin = (roomID:string, token:string) => {
        console.log("rejoining")
        if(!socket) return 'Socket error.'
        if(!token) return 'No token.'
        socket.emit('rejoin',{roomID,token},(playerID:number)=>{
            console.log(playerID)
            setMyPlayerId(playerID)
        })
    }

    const contextValue: GameContextType = {
        numberOfPlayers,
        playerName,
        game,
        startGame,
        joinGame,
        applyMove,
        applyPass,
        token,
        myPlayerId,
        rejoin



    }
    return (
        <GameContext.Provider value={contextValue}>
            {children}
        </GameContext.Provider>
    )
}


