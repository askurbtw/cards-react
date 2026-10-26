import type { Socket } from 'socket.io-client';

export default interface SocketContextType{
    token:string | null,
    socket: Socket | null,
    
    makeHandshake : ()=>void,
    updateToken:(token: string)=>void
    
}