import { Navigate } from 'react-router-dom'
import {useGame} from '../context/GameContext'

export default function GamePage() {
    const {numberOfPlayers, playerName} = useGame()

    if(!numberOfPlayers){
        return <Navigate to='/' replace/>
    }

    return (<>
        <h1>{`Welcome to a ${numberOfPlayers}-players game. Your name is ${playerName}`}</h1>
    </>)
}