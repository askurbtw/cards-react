import { useEffect, useState } from "react";
import { type ReactNode } from "react";
import { GameContext } from "./GameContext";
import type { GameContextType, GameView } from "@shared/types";

import { useSocket } from "./SocketContext";
import type SocketResponse from "@shared/types/socketresponse.types";
import customDelay from "@shared/utils/customDelay";







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
        socket.on("broadcast", async (newState: GameView[]) => {
            console.log("broadcast", newState)
            if (newState.length === 1) { setGame(newState[0]) }
            else {
                for (const state of newState) {
                    
                    setGame(state)
                    await customDelay(3000)
                }

            }

        })
        return () => {
            console.log("Unmounting")
            socket.disconnect()
        }

    }, [makeHandshake, socket])

    const joinRoomAsync = (data: { state: GameView, roomId: string, playerName: string }, gameType: 's' | 'm') => {
        if (!socket) return
        return new Promise<void>((resolve, reject) => {
            if(!gameType) return reject("GameType was not specified.")
            if (gameType === 'm') {
                socket.emit("join_room", { roomId: data.roomId, playerName: data.playerName }, (response: SocketResponse) => {
                    if (response.error) {
                        reject(new Error(response.error))
                    }
                    const playerID = response.data.playerID
                    setMyPlayerId(playerID)
                    const players = [...data.state.players.slice(playerID), ...data.state.players.slice(0, playerID)]
                    data.state.players = players
                    setGame(data.state)
                    updateToken(response.data.token)
                    setNumberOfPlayers(data.state.numberOfPlayers)
                    console.log(data)
                    return resolve()

                })

            }
            if (gameType === 's') {
                console.log(gameType)
                socket.emit("single_player", { roomId: data.roomId, playerName: data.playerName }, (response: SocketResponse) => {
                    if (response.error) {
                        reject(new Error(response.error))
                    }
                    const playerID = response.data.playerID
                    setMyPlayerId(playerID)
                    const players = [...data.state.players.slice(playerID), ...data.state.players.slice(0, playerID)]
                    data.state.players = players
                    setGame(data.state)
                    updateToken(response.data.token)
                    setNumberOfPlayers(data.state.numberOfPlayers)
                    console.log(data)
                    return resolve()

                })

            }

        })
    }
    const makeMoveAsync = (cardId: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (!socket) {
                
                reject('No socket');
                return 'No socket'
            }
            socket.emit("make_move", cardId, (response: SocketResponse) => {
                console.log("making move")
                if (response.error) {
                    console.log(response.error)
                    reject(response.error)
                    return response.error
                }
                resolve('Success.')
            })
        })
    }
    const startGame = async (numberOfPlayers: number, playerName: string, gameType: 's' | 'm'): Promise<string> => {
        if (!socket) return 'Socket error.'
        setNumberOfPlayers(numberOfPlayers)
        setPlayerName(playerName)
        const response = await fetch('/routes/create/room', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                numberOfPlayers,
                playerName,
                gameType
            })
        })
        if (!response.ok) {
            throw new Error('Server error')
        }

        const data = await response.json();
        await joinRoomAsync({ state: data.state, roomId: data.roomId, playerName }, gameType)
        console.log("resolved")
        return data.roomId

    }
    const joinGame = async (playerName: string, roomID: string, gameType: 's' | 'm'): Promise<string> => {
        if (!socket) return 'Socket error.'
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
        await joinRoomAsync({ state: data.state, roomId: data.roomId, playerName }, gameType)
        return data.roomId
    }

    const applyMove = async (cardID: string): Promise<string> => {
        
        if (!game || !socket) return 'Game or socket is not defined.'
        try{
            const result = await makeMoveAsync(cardID)
            console.log(result)
            return result
        }
        catch(err){
            console.log(err)
            if(err==='Invalid move.') return err
        }
        return ''
        
    }

    const applyPass = (): string => {
        let error: string = '';
        if (!game || !socket) return 'Game or socket is not defined.'
        socket.emit("make_pass", (response: SocketResponse) => {
            if (response && response.error) {
                console.log(response.error)
                error = response.error
            }
        })
        return error ? error : 'Success.'

    }
    const rejoin = (roomID: string, token: string) => {
        console.log("rejoining")
        if (!socket) return 'Socket error.'
        if (!token) return 'No token.'
        socket.emit('rejoin', { roomID, token }, (playerID: number) => {
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


