import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway.js';
import { SocketService } from './socket.service.js';

@Module({
  providers: [SocketGateway, SocketService],
  exports:[SocketService]
})
export class SocketModule {}
