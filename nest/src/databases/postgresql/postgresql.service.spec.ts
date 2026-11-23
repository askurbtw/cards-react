import { Test, TestingModule } from '@nestjs/testing';
import { PostgresqlService } from './postgresql.service.js';

describe('PostgresqlService', () => {
  let service: PostgresqlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostgresqlService],
    }).compile();

    service = module.get<PostgresqlService>(PostgresqlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
