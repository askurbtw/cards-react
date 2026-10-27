import {  useCallback, useState, type ReactNode } from "react";
import { io, Socket } from 'socket.io-client';
import { SocketContext } from "./SocketContext";
import type SocketContextType from "@shared/types/socketcontexttype.types";



export const SocketContextProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string| null>(()=>{
        return window.localStorage.getItem("token")
    })
    const [socket, setSocket] = useState<Socket | null>(null)

    const makeHandshake = useCallback(() => {
        const initialToken = window.localStorage.getItem("token")
        const socket = io('http://localhost:8000',{
            auth:{
                token :initialToken
            }
        })
        socket.on("connect", () => {
            setSocket(socket)
            
            console.log("connected")
            
        })
        
    },[])
    const updateToken = (token:string) =>{
        setToken(token)
        window.localStorage.setItem("token", token)
    }
    const contextValue: SocketContextType= {
        token,
        socket,
        
        makeHandshake,
        updateToken
    }

    return (<SocketContext.Provider value={contextValue}>
        {children}</SocketContext.Provider>)
}