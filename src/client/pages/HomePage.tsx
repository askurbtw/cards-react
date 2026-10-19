import {  useState } from "react";
import SinglePlayerPage from "./SinglePlayerPage";
import MultiPlayerPage from "./MultiPlayerPage";



export default function HomePage() {
    const [mode,setMode] = useState<string>('single')
    
    const singlePlayerClick = ()=>{
        if(mode!=='single')
        setMode('single')
    }
    const multiplayerClick = ()=>{
        if(mode!=='multiplayer')
        setMode('multiplayer')
    }
    return (
        <>
            <div>
                <header>
                    <nav>
                        <div id="header-li">
                            <ul>
                                <li><button className="game-btn" onClick={singlePlayerClick}>Single Player</button></li>
                                <li><button className="game-btn" onClick={multiplayerClick}>Multiplayer</button></li>
                            </ul>
                        </div>
                    </nav>
                </header>
                {mode==='single'?<SinglePlayerPage/>:<MultiPlayerPage/>}
            </div>
        </>
    )
}