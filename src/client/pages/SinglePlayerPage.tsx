import { useNavigate } from "react-router-dom"
import { useGame } from "../context/GameContext"
import { useState } from "react"

export default function SinglePlayerPage(): React.JSX.Element {
    const { startGame } = useGame()
    const navigate = useNavigate()
    const [numberOfPlayers, setNumberOfPlayers] = useState<number | null>(null)
    const [playerName, setPlayerName] = useState<string>('')
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPlayerName(String(event.target.value))
    }
    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setNumberOfPlayers(Number(event.target.value))
    }
    const handleClick = async () => {

        if (!numberOfPlayers) {
            alert(`Number of players was not selected.`)
            return
        }
        if (!playerName) {
            alert(`Player name was not assigned.`)
            return
        }
        try {
            const roomId = await startGame(numberOfPlayers, playerName, 's')
            navigate(`/GamePage/${roomId}`)
        }
        catch (error) {
            console.log(error)
            alert('Error occured during game creating. Maybe render service is waking up, try again later.')
            return
        }
    }


return (
    <div id='game-settings-game-launch'>
        <div id="game-settings">
            <div id="game-settings-text"><h2>Game settings</h2>
                <h4>Configure game settings</h4></div>
            <div id="name-div"><input className="name-input" onChange={handleInputChange} placeholder="Enter your name..." /></div>
            <div id="select-div">
                <label htmlFor="players-select" id="players-label"
                >Select number of players
                </label>
                <select name="players-select" id="players-select" onChange={handleSelectChange} defaultValue={""}>
                    <option value="" disabled>Players</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                </select>
            </div>
            <div id="game-launch">
                <button className="game-btn white" onClick={handleClick}>Start Game</button>
            </div>
        </div>

    </div>
)
}