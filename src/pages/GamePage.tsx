import { Navigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { DeckComponent } from '../components/DeckComponent'
import createDeck from '../gameLogic/createDeck'
import '/legacy/style.css'
import { initializePlayers } from '../gameLogic/initializePlayers'
import { useEffect, useState } from 'react'
import PlayerComponent from '../components/PlayerComponent'
import type { Deck, Player } from '../types'


export default function GamePage() {
    const numberOfCards = 36

    const { numberOfPlayers, playerName } = useGame()
    const [players, setPlayers] = useState<Player[]>([])
    const [deck, setDeck] = useState<Deck>({ numberOfCards: numberOfCards, cards: [], trump: null })
    console.log(numberOfPlayers, playerName)
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
                    <div id="field">
                        <div id="game-text"></div>
                        <div id="game-field">
                            <div id="cards-part-of-field">
                                <div id="cards-1">

                                </div>
                                <div id="cards-2">

                                </div>
                                <div id="cards-3">

                                </div>
                                <div id="cards-4">

                                </div>
                                <div id="cards-5">

                                </div>
                                <div id="cards-6">

                                </div>
                            </div>
                            <div id="deck-part-of-field">
                                <DeckComponent deck={deck} />
                                <div id="leftovers">

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>)
}