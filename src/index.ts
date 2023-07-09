import dotenv from 'dotenv';
import express, { Express, Request, Response, Router } from 'express';
import * as fs from 'fs';
import { createServer } from 'http';
import * as path from 'path';
import { Server } from 'socket.io';
import cors from 'cors';

import { AppRoutes } from './routes';

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
    });

    socket.on('play-pause', () => {
      io.sockets.in(roomId).emit('play');
    });

    socket.on('play', () => {});

    socket.on('disconnect', () => {
      console.log('A user disconnected');
      io.sockets.in(roomId).emit('action',{ message: `${socket.id} disconnected the room` });
    });
});

app.use('/api', AppRoutes);

app.route('/test').get((req: Request, res: Response) => {
    console.log('here');
    return res.send('init test')  ;
  });

const port = process.env.PORT;
server.listen(port, () => {
  console.log(`server started on port ${port}`);
});















// app.get('/videoplayer', (req: Request, res: Response) => {
//   const range = req.headers.range ? req.headers.range : '';
//   const videoPath = path.join(__dirname, 'public', '2s.mp4');
//   const videoSize = fs.statSync(videoPath).size
//   const chunkSize = 1 * 1e6;
//   const start = Number(range.replace(/\D/g, ""))
//   const end = Math.min(start + chunkSize, videoSize - 1)
//   const contentLength = end - start + 1;
//   const headers = {
//       "Content-Range": `bytes ${start}-${end}/${videoSize}`,
//       "Accept-Ranges": "bytes",
//       "Content-Length": contentLength,
//       "Content-Type": "video/mp4"
//   }
//   res.writeHead(206, headers)
//   const stream = fs.createReadStream(videoPath, {
//       start,
//       end
//   })
//   stream.pipe(res)
// })

