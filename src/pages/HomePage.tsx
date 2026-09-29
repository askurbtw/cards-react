
import {  useState } from "react";
import { useGame } from "../context/GameContext";
import { useNavigate } from "react-router-dom";



export default function HomePage() {
    const {startGame} = useGame()
    const navigate = useNavigate()
    const [numberOfPlayers, setNumberOfPlayers]=useState<number | null >(null)
    const [playerName, setPlayerName] = useState<string>('')
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPlayerName(String(event.target.value))
    }
    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setNumberOfPlayers(Number(event.target.value))
    }
    const handleClick = () => {
        if (!numberOfPlayers) {
            alert(`Number of players was not selected.`)
            return
        }
        if(!playerName){
            alert(`Player name was not assigned.`)
            return
        }
        startGame(numberOfPlayers,playerName)
        navigate('/GamePage')

    }
    return (
        <>
            <div>
                <header>
                    <nav>
                        <div id="header-li">
                            <ul>
                                <li><h2>Single Player</h2></li>
                                <li><h2>Multiplayer</h2></li>
                            </ul>
                        </div>
                    </nav>
                </header>
                <div id="game-settings">
                    <div id="name-div"><input id="name-input" onChange={handleInputChange} placeholder="Enter your name..." /></div>
                    <div id="select-div">
                        <label htmlFor="players-select" id="players-label"
                        >Select number of players
                        </label>
                        <select name="players-select" id="players-select" onChange={handleSelectChange} defaultValue={undefined}>
                            <option value="" disabled>Players</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                        </select>
                    </div>
                </div>
                <div id="game-launch">
                    <button id="start-game" onClick={handleClick}>Start Game</button>
                </div>
            </div>
        </>
    )
}