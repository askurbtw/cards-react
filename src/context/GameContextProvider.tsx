import { useEffect, useState } from "react";
import { type ReactNode } from "react";
import { GameContext } from "./GameContext";
import type { Card, GameState, } from "../types";
import createGame from "../gameLogic/createGame";
import makeMove from "../gameLogic/makeMove";
import makePass from "../gameLogic/makePass";
import botFindValidCard from "../gameLogic/botFindValidCard";

export const GameContextProvider = ({ children }: { children: ReactNode }) => {
    const [numberOfPlayers, setNumberOfPlayers] = useState<number | null>(null)
    const [playerName, setPlayerName] = useState<string | null>(null)
    const [game, setGame] = useState<GameState | null>(null)

    const startGame = (numberOfPlayers: number, playerName: string) => {
        setNumberOfPlayers(numberOfPlayers)
        setPlayerName(playerName)
        setGame(createGame(numberOfPlayers, playerName))
    }
    const applyMove = (card: Card) => {
        if (!game) return
        console.log(`Applying move with a ${card.value}_${card.suit} card`)
        const newState = makeMove(game, card)
        setGame(newState)
        console.log("State was updated.")
    }

    const applyPass = () => {
        if (!game) return
        console.log("Applying pass")
        const newState = makePass(game)
        setGame(newState)
        console.log("State was updated.")
    }

    useEffect(() => {
        if (game?.currentId != 0 && game) {
            console.log("Bot Move")
            setTimeout(() => {
                const validCard = botFindValidCard(game)
                if (validCard) {
                    console.log(`Applying move with a ${validCard.value}_${validCard.suit} card`)
                    const newState = makeMove(game, validCard)
                    setGame(newState)
                    console.log("State was updated.")
                }
                else {
                    console.log("Applying pass")
                    const newState = makePass(game)
                    setGame(newState)
                    console.log("State was updated.")
                }
            }, 3500);
        }
        return
    }, [game])


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


