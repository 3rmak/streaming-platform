import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import axios from 'axios';

import * as fs from 'fs';
import path from 'path';
import * as cors from 'cors';
import * as BodyParser from 'body-parser';
import dotenv from 'dotenv';

import LocalContentController from './controllers/local-content/local-content.controller';

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
const m3u8 =
  'https://psi.stream.voidboost.cc/5d968aee9fbee1a5b22594514c2dc8bf:2023032319:52367a4e-a3e4-4a6d-ae7a-7533b22267b3/7/8/6/5/7/3/v9r76.mp4:hls:manifest.m3u8';

app.use(
  cors.default({
    origin: '*',
  })
);
app.use(BodyParser.urlencoded());
app.use(BodyParser.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.use('/api/local-content', LocalContentController);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

io.on('connection', (socket: Socket) => {
  console.log(`new connection by ${socket.id}`);

  socket.on('message', (message: string) => {
    console.log(message);
    io.emit('message', `${socket.id.substr(0, 2)} said ${message}`);
  });

  // socket.on('play', () => {
  //   console.log('play');
  //   io.emit('play');
  // });

  socket.on('disconnect', () => {
    console.log('a user disconnected!');
  });
});

io.listen(ioPort);
