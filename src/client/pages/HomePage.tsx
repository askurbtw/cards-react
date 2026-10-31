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
            <div id='home-page'>
                <header>
                    <nav>
                            <ul>
                                <li > {mode==='single'?<div className="focus-top"></div>:undefined} <button className={` ${mode==='single'?'focus':undefined}`} onClick={singlePlayerClick}><h3>Single Player</h3></button></li>
                                <li > {mode==='multiplayer'?<div className="focus-top"></div>:undefined} <button className={` ${mode==='multiplayer'?'focus':undefined}`} onClick={multiplayerClick}><h3>Multiplayer</h3></button> </li>
                            </ul>
                    </nav>
                </header>
                {mode==='single'?<SinglePlayerPage/>:<MultiPlayerPage/>}
            </div>
        </>
    )
}