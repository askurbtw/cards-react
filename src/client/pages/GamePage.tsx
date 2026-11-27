
import { useGame } from '../context/GameContext'
import '../../style.css'
import PlayerComponent from '../components/PlayerComponent'
import TableComponent from '../components/TableComponent'
import getPlayer from '@shared/utils/getPlayer'

import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useSocket } from '../context/SocketContext'


export default function GamePage() {
    const navigate = useNavigate()
    const { game, rejoin } = useGame()
    const {socketID,token} = useSocket()
    const path = window.location.pathname
    const roomID = path.split('/')[2]
    useEffect(()=>{
        if(game || (!socketID || !token))
            return
        
        console.log("rejoining")
        const result = rejoin(roomID)
        console.log(result)
    },[game,socketID,token,rejoin,roomID])
    const handleGoBack = () => {

        navigate(`/`)
    }
    if (!game) {
        console.log("no game")
        if (!roomID) {
            alert("Room undefined.")
            navigate(`/`)
        }
        return
    }
    const gameText = game.status === "waiting for players" ? `Waiting for ${game.numberOfPlayers - game.playersOnline} more players` :
        game.currentId !== undefined && game.attackerId !== undefined && game.defenderId !== undefined ? game.currentId === game.attackerId
            ? `${getPlayer(game.players, game.attackerId).name}'s turn against ${getPlayer(game.players, game.defenderId).name}`
            : `${getPlayer(game.players, game.currentId).name}'s turn`
            : ''
    console.log(gameText)
    if (game.status === "finished") {
        return (
            <div id='game-page'>
                <div id="game-grid">
                    <div id='game-results-card'>
                        <h1>{`Winner is: ${getPlayer(game.players, game.finishOrder[0].playerIngameId).name}`}</h1>
                        <h2>Finish order</h2>
                        <ol>
                            {game.finishOrder.map((player) => {
                                return (
                                    <li>{getPlayer(game.players, player.playerIngameId).name}</li>
                                )
                            })}
                        </ol>
                        <button id='back-btn' onClick={handleGoBack}>Go back to home page.</button></div></div>
            </div>
        )
    }




    return (<>
        <div id='game-page'>
            <div id="game-grid">
                {game.players.map((player, index) => {
                    return <PlayerComponent key={player.id} playerInfo={player} index={index} />
                })}

                <TableComponent deck={game.deck} text={gameText} currentCards={game.currentCards} leftovers={game.leftovers} status={game.status} roomId={roomID} />

            </div>
        </div>
    </>)
}