
import { useGame } from '../context/GameContext'
import '../../style.css'
import PlayerComponent from '../components/PlayerComponent'
import TableComponent from '../components/TableComponent'
import getPlayer from '@shared/utils/getPlayer'
import { useSocket } from '../context/SocketContext'
import { useNavigate } from 'react-router-dom'


export default function GamePage() {
    const navigate = useNavigate()
    const { game, rejoin } = useGame()
    const {socket, token} = useSocket()
    const handleGoBack = () =>{
        
        navigate(`/` )
    }
   
    if (!game) {
        console.log("no game")
        if(!socket){
            return (<div>
                <h1>Loading...</h1>
            </div>)
        }
        const path = window.location.pathname
        const roomID = path.split('/')[2]
        console.log(roomID)

        if(!roomID){
            alert("Room undefined.")
            navigate(`/` )
        }
        rejoin(roomID, token||'' )
        
        return
        // return <Navigate to='/' replace />
    }
    const gameText = game.status === "waiting for players" ? `Waiting for ${game.numberOfPlayers - game.playersOnline} more players` :
        game.currentId!==undefined && game.attackerId!==undefined && game.defenderId!==undefined ? game.currentId === game.attackerId
            ? `${getPlayer(game.players, game.attackerId).name}'s turn against ${getPlayer(game.players, game.defenderId).name}`
            : `${getPlayer(game.players, game.currentId).name}'s turn`
            : ''
    console.log(gameText)
    if (game.status === "finished") {
        
        return (
            <>
                <h1>{`Winner is: ${getPlayer(game.players,game.finishOrder[0]).name}`}</h1>
                <h2>Finish order</h2>
                <ol>
                    {game.finishOrder.map((player) => {
                        return (
                            <li>{getPlayer(game.players, player).name}</li>
                        )
                    })}
                </ol>
                <button onClick={handleGoBack}>Go back to home page.</button>
            </>
        )
    }




    return (<>
        <div>
            <div id="game-grid">
                {game.players.map((player, index) => {
                    return <PlayerComponent key={player.id} playerInfo={player} index={index} />
                })}
                <div id="cards-field">
                    <TableComponent deck={game.deck} text={gameText} currentCards={game.currentCards} leftovers={game.leftovers} />
                </div>
            </div>
        </div>
    </>)
}