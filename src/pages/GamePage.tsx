import { Navigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'

import createDeck from '../gameLogic/createDeck'
import '/legacy/style.css'
import { initializePlayers } from '../gameLogic/initializePlayers'
import { useEffect, useState } from 'react'
import PlayerComponent from '../components/PlayerComponent'
import type { Card, Deck, Player, DeckCard } from '../types'
import TableComponent from '../components/TableComponent'

export default function GamePage() {
    const numberOfCards = 36

    const { numberOfPlayers, playerName } = useGame()
    const [players, setPlayers] = useState<Player[]>([])
    const [deck, setDeck] = useState<Deck>({ numberOfCards: numberOfCards, cards: [], trump: null })
    console.log(numberOfPlayers, playerName)
    const [currentCards, setCurrentCards] = useState<DeckCard[]>([])
    const [leftoversCards, setLeftoversCards] = useState<Card[]>([])

    useEffect(() => {
        const deckTemp = createDeck()
        const [players,deckCopy] = initializePlayers(numberOfPlayers??0, playerName??'', deckTemp)
        setPlayers(players)
        setDeck(deckCopy)

    }, [])
    if (!numberOfPlayers || !playerName) {
        return <Navigate to='/' replace />
    }

    


    return (<>
        <div>
            <div id="game-grid">
                {players.map((player) => {
                    return <PlayerComponent key = {player.id} playerInfo={player} />
                })}
                <div id="cards-field">
                    <TableComponent deck={deck} text={"Hello"} currentCards={currentCards} leftovers={leftoversCards}/>
                </div>
            </div>
        </div>
    </>)
}