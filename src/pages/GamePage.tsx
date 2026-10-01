import { Navigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import '/legacy/style.css'
import PlayerComponent from '../components/PlayerComponent'
import TableComponent from '../components/TableComponent'
import getPlayer from '../utils/getPlayer'

export default function GamePage() {
    const {game} = useGame()
    if (!game) {
        return <Navigate to='/' replace />
    }
    
    return (<>
        <div>
            <div id="game-grid">
                {game.players.map((player) => {
                    return <PlayerComponent key={player.id} playerInfo={player} />
                })}
                <div id="cards-field">
                    <TableComponent deck={game.deck} text={`${getPlayer(game.players,game.attackerId).name}' turn to ${getPlayer(game.players,game.defenderId).name}`} currentCards={game.currentCards} leftovers={game.leftovers} />
                </div>
            </div>
        </div>
    </>)
}