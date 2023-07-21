import { Server, Socket } from 'socket.io';

const roomId = process.env.DEFAULT_ROOM_ID;

export const ChatSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    socket.on('message', (message) => {
      console.log(`${socket.id} send ${message}`);
      io.sockets.in(roomId).emit('message', { sender: socket.id, message: message });
    })
  })
}
