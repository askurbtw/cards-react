import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabasesModule } from './databases/databases.module.js';

import { RoomsModule } from './rooms/rooms.module.js';
import { GamesModule } from './games/games.module.js';
import { SocketModule } from './socket/socket.module.js';



@Module({
  imports: [ DatabasesModule,  RoomsModule, GamesModule, SocketModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
