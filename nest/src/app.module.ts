import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabasesModule } from './databases/databases.module.js';


@Module({
  imports: [ DatabasesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
