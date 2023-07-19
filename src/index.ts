import dotenv from 'dotenv';
import express, { Express, Request, Response, Router } from 'express';
import * as fs from 'fs';
import { createServer } from 'http';
import * as path from 'path';
import { Server } from 'socket.io';
import cors from 'cors';

import { AppRoutes } from './routes';
import { PlayPauseDto } from './dto/play_pause.dto';
import { PlayPauseActionEnum } from './dto/play_pause-action.enum';

dotenv.config();

const app: Express = express();
app.use(cors({ origin: process.env.CORS_ALLOWED_HOSTS }))

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const roomId = '123';
const videoPath = path.join(__dirname, '..', 'public', 'video.mp4');
const chunkSize = 1 * 1e6;

let videoState: PlayPauseActionEnum = PlayPauseActionEnum.PAUSE;
let videoTime: number = 0;

io.on('connection', (socket) => {
    console.log('a user connected');
    io.sockets.in(roomId).emit('action', { message: `${socket.id} connected the room` });

    socket.on('message', (message) => {
      console.log(`${socket.id} send ${message}`);
      io.sockets.in(roomId).emit('message', { sender: socket.id, message: message });
    })

    // socket.on('new-room', (roomName) => {
    //   console.log(`${socket.id} created room ${roomName}`);
    // });

    socket.on('join_room', (roomId) => {
      console.log(`${socket.id} joined room ${roomId}`);
      socket.join(roomId);

      const playPauseDto: PlayPauseDto = { action: PlayPauseActionEnum.PAUSE, time: videoTime };
      console.log('playPauseDto join_room', playPauseDto);
      io.sockets.in(roomId).emit('play_pause', playPauseDto);
    });

    socket.on('play_pause', (dto: PlayPauseDto) => {
      videoState = dto.action;
      videoTime = dto.time;
      console.log('play_pause', dto);
      io.sockets.in(roomId).emit('play_pause', dto);
    });

    socket.on('range', (time: number) => {
      console.log('range', time);
      io.sockets.in(roomId).emit('range', time);
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
      io.sockets.in(roomId).emit('action',{ message: `${socket.id} disconnected the room` });
    });
});

app.use('/api', AppRoutes)

app.route('/test').get((req: Request, res: Response) => {
    console.log('here');
    return res.send('init test')  ;
  });

const port = process.env.PORT;
server.listen(port, () => {
  console.log(`server started on port ${port}`);
});
