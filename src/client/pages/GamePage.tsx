import {  Navigate  } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import '../../style.css'
import PlayerComponent from '../components/PlayerComponent'
import TableComponent from '../components/TableComponent'
import getPlayer from '@shared/utils/getPlayer'

export default function GamePage() {
    const {game} = useGame()
    
    
    if (!game) {
        return <Navigate to='/' replace />
    }
    
    const current = getPlayer(game.players, game.currentId)
    const attacker = getPlayer(game.players, game.attackerId)
    const defender = getPlayer(game.players, game.defenderId)

    const gameText = game.currentId === game.attackerId
        ? `${attacker.name}'s turn against ${defender.name}`
        : `${current.name}'s turn`
    
    if(game.status==="finished"){
        return (
            <>
            <h1>{`Winner is: ${game.finishOrder[0]}`}</h1>
            <h2>Finish order</h2>
            <ol>
                {game.finishOrder.map((player)=>{
                    return (
                        <li>{getPlayer(game.players,player).name}</li>
                    )
                })}
            </ol>
            </>
        )
    }
    return (<>
        <div>
            <div id="game-grid">
                {game.players.map((player) => {
                    return <PlayerComponent key={player.id} playerInfo={player} />
                })}
                <div id="cards-field">
                    <TableComponent deck={game.deck} text={gameText} currentCards={game.currentCards} leftovers={game.leftovers} />
                </div>
            </div>
        </div>
    </>)
}