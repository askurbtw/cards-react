import { useNavigate } from "react-router-dom"
import { useGame } from "../context/GameContext"
import { useState } from "react"

export default function MultiPlayerPage(): React.JSX.Element {
    const { startGame, joinGame } = useGame()
    const navigate = useNavigate()
    const [numberOfPlayers, setNumberOfPlayers] = useState<number | null>(null)
    const [playerName, setPlayerName] = useState<string>('')
    const [type, setType] = useState<string>('create')
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
        try{
        const roomId = await startGame(numberOfPlayers, playerName, "m")
        navigate(`/GamePage/${roomId}`)
        }
        catch(error){
            console.log(error)
            alert('Error occured during game creating. Maybe render service is waking up, try again later.')
            return
        }

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
        try{
        const roomId = await joinGame(playerName, joinRoomId, "m")
        navigate(`/GamePage/${roomId}`)
        }
        catch(error){
            if(error instanceof Error){
                console.log(error)
                alert(error.cause)
                return
            }
            console.log(error)
            alert('Error occured during game joining. Maybe render service is waking up, try again later.')
            return
        }

    }
    return (
        <div id='game-settings-game-launch'>
            
            <div id="game-settings">
                <div id="game-settings-text"><h2>Game settings</h2>
                <h4>Configure game settings</h4></div>
                <div id="name-div"><input className="name-input" onChange={handleNameInputChange} placeholder="Enter your name..." /></div>
                <div id="type-selection">
                    <button className={`game-btn ${type==='join'?'focus':undefined}`} onClick={handleTypeClick}>Join Game</button>
                    <button className={`game-btn ${type==='create'?'focus':undefined}`} onClick={handleTypeClick}>Create Game</button>
                </div>
                {type === 'create' ?
                    <>
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
                            <button className="game-btn white" onClick={handleCreateClick}>Start Game</button>
                        </div>
                    </> :
                    type === 'join' ?
                        <>
                            <div id="name-div"><input className="name-input" onChange={handleRoomInputChange} placeholder="Enter room ID..." /></div>
                            <div id="game-launch">
                                <button className="game-btn white" onClick={handleJoinClick}>Join</button>
                            </div>
                        </>
                        : null
                }

            </div>

        </div>
    )
}