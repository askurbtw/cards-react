import { useNavigate } from "react-router-dom"
import { useGame } from "../context/GameContext"
import { useState } from "react"

export default function MultiPlayerPage(): React.JSX.Element {
    const { startGame, joinGame } = useGame()
    const navigate = useNavigate()
    const [numberOfPlayers, setNumberOfPlayers] = useState<number | null>(null)
    const [playerName, setPlayerName] = useState<string>('')
    const [type, setType] = useState<string>('')
    const [joinRoomId, setJoinRoomId] = useState<string>('')
    const handleNameInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPlayerName(String(event.target.value))
    }
    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setNumberOfPlayers(Number(event.target.value))
    }
    const handleRoomInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setJoinRoomId(String(event.target.value))
    }
    const handleCreateClick = async () => {
        if (!numberOfPlayers) {
            alert(`Number of players was not selected.`)
            return
        }
        if (!playerName) {
            alert(`Player name was not assigned.`)
            return
        }
        
        const roomId = await startGame(numberOfPlayers, playerName, "m")
        navigate(`/GamePage/${roomId}`)

    }
    const handleTypeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        const typeSelected = event.currentTarget.textContent
        if (type === typeSelected) return
        const parsedType = typeSelected === 'Join Game' ? 'join' : 'create'
        setType(parsedType)
    }
    const handleJoinClick = async () => {
        if (!playerName) {
            alert(`Player name was not assigned.`)
            return
        }
        if (!joinRoomId) {
            alert(`Room id was not assigned.`)
            return
        }
        const roomId = await joinGame(playerName, joinRoomId, "m")
        navigate(`/GamePage/${roomId}`)

    }
    return (
        <div>
            <div id="game-settings">
                <div id="name-div"><input className="name-input" onChange={handleNameInputChange} placeholder="Enter your name..." /></div>
                <div id="type-selection">
                    <button className="game-btn" onClick={handleTypeClick}>Join Game</button>
                    <button className="game-btn" onClick={handleTypeClick}>Create Game</button>
                </div>
                {type === 'create' ?
                    <div>
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
                            <button className="game-btn" onClick={handleCreateClick}>Start Game</button>
                        </div>
                    </div> :
                    type === 'join' ?
                        <div>
                            <div id="name-div"><input className="name-input" onChange={handleRoomInputChange} placeholder="Enter room ID..." /></div>
                            <div id="game-launch">
                                <button className="game-btn" onClick={handleJoinClick}>Join</button>
                            </div>
                        </div>
                        : null
                }

            </div>

        </div>
    )
}