import {IoAdapter} from '@nestjs/platform-socket.io'
import { ServerOptions } from 'socket.io'


export class CorsIOAdapter extends IoAdapter {
    createIOServer(port: number | undefined, options?: ServerOptions) {
        const serverOptions: Partial<ServerOptions> = {
      ...options,
      path: options?.path ?? '/socket.io',
      cors: {
        origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
      },
    };

    return super.createIOServer(port, serverOptions as ServerOptions);
    }
}