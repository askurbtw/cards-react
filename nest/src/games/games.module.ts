import { Module } from '@nestjs/common';
import { GamesService } from './games.service.js';
import { GamesGateway } from './games.gateway.js';
import { SocketModule } from '../socket/socket.module.js';
import { DatabasesModule } from '../databases/databases.module.js';
import { RoomsModule } from '../rooms/rooms.module.js';

@Module({
  providers: [GamesService, GamesGateway],
  imports: [SocketModule, DatabasesModule, RoomsModule]
})
export class GamesModule {}
