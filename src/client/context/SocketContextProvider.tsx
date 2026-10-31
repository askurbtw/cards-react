import {   useEffect, useState, type ReactNode } from "react";
import { io, Socket } from 'socket.io-client';
import { SocketContext } from "./SocketContext";
import type SocketContextType from "@shared/types/socketcontexttype.types";



export const SocketContextProvider = ({ children }: { children: ReactNode }) => {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
    const [token, setToken] = useState<string| null>(()=>{
        return window.localStorage.getItem("token")
    })
    const [socket, setSocket] = useState<Socket | null>(null)


    useEffect(()=>{
        const initialToken = window.localStorage.getItem("token")
        const socket = io(BACKEND_URL,{
            auth:{
                token :initialToken
            },
            transports:['polling'],
        })
        socket.on("connect", () => {
            setSocket(socket)
            
            console.log("connected")
            
        })
        return ()=>{
            socket.disconnect()
        }
    },[BACKEND_URL])
    
    const updateToken = (token:string) =>{
        setToken(token)
        window.localStorage.setItem("token", token)
    }
    const contextValue: SocketContextType= {
        token,
        socket,
        
        
        updateToken
    }

    return (<SocketContext.Provider value={contextValue}>
        {children}</SocketContext.Provider>)
}