import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import * as fs from 'fs';
import * as cors from 'cors';
import * as BodyParser from 'body-parser';
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
let videoSrcLink = '';

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

app.post('/link', (req: Request, res: Response) => {
  console.log(`req.body ${JSON.stringify(req.body)}`);
  videoSrcLink = req.body.link;
  console.log(`NEW LINK IS ${videoSrcLink}`);

  return res.send();
});

app.get('/video', function (req, res) {
  const range = req.headers.range;
  if (!range) {
    res.status(400).send('Requires Range header');
  }
  const videoPath = 'dead_poet_society.mp4';
  const videoSize = fs.statSync(videoPath).size;
  const CHUNK_SIZE = 10 ** 6;
  const start = Number(range?.replace(/\D/g, ''));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  const contentLength = end - start + 1;
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': 'video/mp4',
  };
  res.writeHead(206, headers);
  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
});

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
