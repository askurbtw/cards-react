import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DomainExceptionFilter } from './common/errors/domain-exception.filter.js';
import { CorsIOAdapter } from './cors-io-adapter.adapter.js';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
  app.useWebSocketAdapter(new CorsIOAdapter(app))
  app.useGlobalFilters(new DomainExceptionFilter())
  await app.listen(process.env.PORT ?? 8000);
}
await bootstrap();
