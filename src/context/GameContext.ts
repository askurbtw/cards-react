import { createContext, useContext} from "react";
import {type GameContextType} from "../types/gamecontexttype.types";

export const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = ()=>{
    const context = useContext(GameContext)
    if(!context){
        throw new Error("useGame must be in GameProvider")
    }
    return context;
}