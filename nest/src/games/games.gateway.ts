import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GamesService } from './games.service.js';
import { SocketService } from '../socket/socket.service.js';
import { RoomsSocketService } from '../rooms/rooms-socket.service.js';



@WebSocketGateway()
export class GamesGateway {
  constructor(private readonly gamesService: GamesService, private readonly socketService: SocketService, private readonly roomsSocketService: RoomsSocketService ) {}
  @SubscribeMessage('make_move')
  async handleMove(@ConnectedSocket() client: Socket, @MessageBody() cardId: string) {
    const roomID = Array.from(client.rooms)[1];
    console.log(cardId, typeof cardId)
    console.log(`Making move with id: ${cardId}` )
    const result = await this.gamesService.makeMove({cardID:cardId, socketID:client.id, roomID})
    const room = result.room
    const stateHistory = result.stateHistory
    if (room.state.isSinglePlayer) {
      this.socketService.getServer().to(client.id).emit("broadcast", stateHistory);
    } else {
      this.roomsSocketService.broadcast(room);
    }
    if (room.state.status === "finished") {
       this.socketService.getServer().in(roomID).socketsLeave(roomID);
    }
  }
  @SubscribeMessage('make_pass')
  async handlePass(@ConnectedSocket() client: Socket, @MessageBody() cardId:string) {
    const roomID = Array.from(client.rooms)[1];
    console.log(roomID)
    const result = await this.gamesService.makePass({cardID:cardId, socketID:client.id, roomID})
    const room = result.room
    const stateHistory = result.stateHistory
    if (stateHistory) {
      this.socketService.getServer().to(client.id).emit("broadcast", stateHistory);
    } else {
      this.roomsSocketService.broadcast(room);
      
    }
    if (room.state.status === "finished") {
       this.socketService.getServer().in(roomID).socketsLeave(roomID);
    }
  }
}
