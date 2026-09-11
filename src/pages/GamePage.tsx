import { Navigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { DeckComponent } from '../components/DeckComponent'
import createDeck from '../gameLogic/createDeck'
import shuffleDeck from '../utils/shuffleDeck'
import '/legacy/style.css'


export default function GamePage() {
    const shuffledDeck = shuffleDeck(createDeck())
    



    const { numberOfPlayers } = useGame()

    if (!numberOfPlayers) {
        return <Navigate to='/' replace />
    }

    return (<>
        <div>
            <div id="game-grid">
                <div id="player-1" className="hand">
                    <button id="pass-btn" className="hidden">Pass</button>
                </div>
                <div id="player-2" className="hand"></div>
                <div id="player-3" className="hand"></div>
                <div id="player-4" className="hand"></div>
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
                                <DeckComponent deck={shuffledDeck}/>
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