import type { Socket } from 'socket.io-client';

export default interface SocketContextType{
    socket: Socket | null,
    isConnected: boolean,
    makeHandshake : (roomID:string)=>boolean
}