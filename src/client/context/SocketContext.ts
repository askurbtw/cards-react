import type SocketContextType from "@shared/types/socketcontexttype.types";
import { createContext, useContext} from "react";


export const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = ()=>{
    const context = useContext(SocketContext)
    if(!context){
        throw new Error("useSocket must be in GameProvider")
    }
    return context;
}