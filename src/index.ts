import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import dotenv from 'dotenv';

import { ClientToServerEvents } from './shared/socket/models/client-to-server-events';
import { ServerToClientEvents } from './shared/socket/models/server-to-client-events';
import { InternalServerEvents } from './shared/socket/models/internal-server-events';
import { SocketData } from './shared/socket/models/socket-data';

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InternalServerEvents,
  SocketData
>(httpServer, { cors: { origin: '*' } });
const port = process.env.PORT || 5000;
const ioPort = Number(process.env.IO_PORT) || 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

io.on('connection', (socket: Socket) => {
  console.log(`new connection by ${socket.data.name}`);

  socket.on('message', (message: string) => {
    console.log(message);
    io.emit('message', `${socket.id.substr(0, 2)} said ${message}`);
  });

  socket.on('disconnect', () => {
    console.log('a user disconnected!');
  });
});

io.listen(ioPort);
