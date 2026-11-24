import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service.js';
import { RoomsController } from './rooms.controller.js';
import { RoomsGateway } from './rooms.gateway.js';
import { RoomsSocketService } from './rooms-socket.service.js';
import { DatabasesModule } from '../databases/databases.module.js';
import { SocketModule } from '../socket/socket.module.js';

@Module({
  providers: [ RoomsService, RoomsSocketService, RoomsGateway],
  controllers: [RoomsController],
  imports:[DatabasesModule, SocketModule],
  exports:[RoomsService, RoomsSocketService]
})
export class RoomsModule {}
