import { Body, Controller, Post } from '@nestjs/common';
import { RoomsService } from './rooms.service.js';
import type CreateRoomRequest from '../../../shared/types/createroomtype.types.js';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post('/create')
  async create(@Body() data: CreateRoomRequest) {
    const response = await this.roomsService.createRoom(data);
    return response;
  }
}
