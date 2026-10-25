import {  useState, type ReactNode } from "react";
import { io, Socket} from 'socket.io-client';
import { SocketContext } from "./SocketContext";


export const SocketContextProvider = ({children}: { children: ReactNode }) => {
    
    const [socket, setSocket] = useState<Socket | null>(null)
    const [isConnected, setIsConnected] = useState<boolean>(false)

    const makeHandshake =  (roomID:string) : boolean => {
        let connected = false
        const socket = io('http://localhost:8000')
        if(socket){
            connected = true
            console.log(`handshaked succesfully.`)
            setIsConnected(true)
            socket.emit("join_room",roomID)
        }
        setSocket(socket)
        return connected
    }
    const contextValue = {
        socket,
        isConnected,
        makeHandshake
    }

    return(<SocketContext.Provider value = {contextValue}>
    {children}</SocketContext.Provider>)
}