import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets';
import { RoomsService } from './rooms.service.js';
import { Socket } from 'socket.io';
import { RoomsSocketService } from './rooms-socket.service.js';

@WebSocketGateway()
export class RoomsGateway implements OnGatewayDisconnect {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly roomsSocketService: RoomsSocketService,
  ) {}
  @SubscribeMessage('join_room')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; playerName: string },
  ) {
    const room = await this.roomsService.joinRoom({
      roomId: data.roomId,
      playerName: data.playerName,
      socketId: client.id,
    });
    if (!room) return WsException;
    client.join(data.roomId);
    this.roomsSocketService.broadcast(room);
  }
  async handleRejoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomID: string },
  ) {
    const token = client.handshake.auth.token;
    if (!token) return;
    const room = await this.roomsService.rejoinRoom({
      token: String(token),
      ...data,
      socketId: client.id,
    });
    if (!room) return;
    client.join(data.roomID);
    this.roomsSocketService.broadcast(room);
  }
  async handleDisconnect(@ConnectedSocket() client: Socket, reason?: string) {
    console.log(`Player ${client.id} disconnected.`);
    console.log('reason: ', reason);
    const roomID = Array.from(client.rooms)[1];
    const result = await this.roomsService.disconnect({
      roomID,
      socketID: client.id,
    });
    if (!result) return;
  }
}
