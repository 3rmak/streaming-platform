import dotenv from 'dotenv';
import express, { Express, Request, Response, Router } from 'express';
import * as fs from 'fs';
import { createServer } from 'http';
import * as path from 'path';
import { Server } from 'socket.io';

import { AppRoutes } from './routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

const server = createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('new-room', (roomName) => {
      console.log('room created');
    });

    socket.on('new-room', (roomName) => {
      console.log('room created');
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
});

app.use('/api', AppRoutes);

app.route('/test').get((req: Request, res: Response) => {
    console.log('here');
    return res.send('init test')  ;
  });

app.route('/auth').post((req: Request, res: Response)=> {
  console.log('req.body', req.body);

  return res.send('autorized');
})

app.listen(port, ()=> {
  console.log(`server started on port ${port}`);
})















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

