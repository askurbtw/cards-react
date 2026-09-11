import { createContext, useContext} from "react";

export interface GameContextType {
    numberOfPlayers: number | null;
    playerName:string | null
    setNumberOfPlayers:(count:number)=>void;
    setPlayerName:(name:string)=>void;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = ()=>{
    const context = useContext(GameContext)
    if(!context){
        throw new Error("useGame must be in GameProvider")
    }
    return context;
}