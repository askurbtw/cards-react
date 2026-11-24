import { Test, TestingModule } from '@nestjs/testing';
import { RoomsSocketService } from './rooms-socket.service.js';

describe('RoomsSocketService', () => {
  let service: RoomsSocketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomsSocketService],
    }).compile();

    service = module.get<RoomsSocketService>(RoomsSocketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
