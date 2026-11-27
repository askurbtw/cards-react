import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { RoomsService } from './rooms.service.js';
import { Socket } from 'socket.io';
import { RoomsSocketService } from './rooms-socket.service.js';
import { DomainError } from '../common/errors/domain.error.js';
import { SocketService } from '../socket/socket.service.js';




@WebSocketGateway()
export class RoomsGateway implements OnGatewayDisconnect {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly roomsSocketService: RoomsSocketService,
    private readonly socketService: SocketService
  ) {}
  @SubscribeMessage('join_room')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; playerName: string },
  ) {
    console.log(`Preparing joining`)
    const room = await this.roomsService.joinRoom({
      roomId: data.roomId,
      playerName: data.playerName,
      socketId: client.id,
    });
    console.log("JOOOOOOOOOOOOOOOOIIIIIIIININNGGG")
    console.log(`Room created`)
    client.join(data.roomId);
    this.roomsSocketService.broadcast(room);
  }

   @SubscribeMessage('single_player')
  async handleSinglePlayerJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; playerName: string },
  ) {
    console.log("Joining single player")
    const result = await this.roomsService.joinSinglePlayer( data.roomId,
      data.playerName,
      client.id,)
    client.join(data.roomId);
    if(result.stateHistory){
      this.socketService.getServer().to(client.id).emit("broadcast", result.stateHistory)
    }
    else{
      this.roomsSocketService.broadcast(result.room)
    }
    return { data: { playerID: result.playerId, token: result.playerToken }, error: "" };
  }
  @SubscribeMessage('rejoin')
  async handleRejoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomID: string },
  ) {
    const token = client.handshake.auth.token;
    if (!token) throw new DomainError('FORBIDDEN','No token.');
    const {room,playerId} = await this.roomsService.rejoinRoom({
      token: String(token),
      ...data,
      socketId: client.id,
    });
    
    client.join(data.roomID);
    this.roomsSocketService.broadcast(room);
    return playerId
    
  }
  async handleDisconnect(@ConnectedSocket() client: Socket, reason?: string) {
    console.log(`Player ${client.id} disconnected.`);
    console.log('reason: ', reason);
    const roomID = Array.from(client.rooms).pop();
    if(roomID===client.id || !roomID) return
    await this.roomsService.disconnect({
      roomID,
      socketID: client.id,
    });
    
  }
}
