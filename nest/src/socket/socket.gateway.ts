import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway } from '@nestjs/websockets';
import { SocketService } from './socket.service.js';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly socketService: SocketService) {}
  afterInit(server: Server)  {
    this.socketService.setServer(server)
  };
  handleConnection(client: Socket) {
    console.log(`socket with id:${client.id} connected.`)
  }
  handleDisconnect(client: Socket, reason?: string) {
    console.log(`socket with id:${client.id} disconnected. Reason: ${reason}`)
  }
  
}
