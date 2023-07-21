import { Server, Socket } from 'socket.io';
import { PlayPauseDto } from '../dto/play_pause.dto';
import { PlayPauseActionEnum } from '../dto/play_pause-action.enum';
import { ChatSocket } from './chat.socket';

const roomId = process.env.DEFAULT_ROOM_ID;

let videoState: PlayPauseActionEnum = PlayPauseActionEnum.PAUSE;
let videoTime: number = 0;

export const initializeSockets = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('a user connected');
    io.sockets.in(roomId).emit('action', { message: `${socket.id} connected the room` });

    // socket.on('message', (message) => {
    //   console.log(`${socket.id} send ${message}`);
    //   io.sockets.in(roomId).emit('message', { sender: socket.id, message: message });
    // })

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

  ChatSocket(io);
};
