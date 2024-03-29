import * as dotenv from 'dotenv'
import * as express from 'express';
import { Express, Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import * as cors from 'cors'

import { AppRoutes } from './routes';
import { initializeSockets } from './sockets';
import * as bodyParser from 'body-parser';

dotenv.config();

const app: Express = express();
// app.use(cors({ origin: process.env.CORS_ALLOWED_HOSTS }))
app.use(cors({ origin: '*' }))

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

initializeSockets(io);

app.use('/api', AppRoutes)

app.route('/api/test').get((req: Request, res: Response) => {
    console.log('here');
    return res.send('init test')  ;
  });

const port = process.env.PORT;
const hostname: string = '0.0.0.0';
// @ts-ignore
server.listen(port, hostname, () => {

  console.log(`server started on port ${port}`);
});
