import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GamesService } from './games.service.js';
import { SocketService } from '../socket/socket.service.js';
import { RoomsSocketService } from '../rooms/rooms-socket.service.js';

@WebSocketGateway()
export class GamesGateway {
  constructor(private readonly gamesService: GamesService, private readonly socketService: SocketService, private readonly roomsSocketService: RoomsSocketService ) {}
  @SubscribeMessage('make_move')
  async handleMove(@ConnectedSocket() client: Socket, @MessageBody() data: {cardId:string}) {
    const roomID = Array.from(client.rooms)[1];
    const result = await this.gamesService.makeMove({cardID:data.cardId, socketID:client.id, roomID})
    if(!result) return
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
}
