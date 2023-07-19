import { Router } from 'express';

import { RoomRoute } from './room.route';
import { VideoRouter } from './video.routes';

export const AppRoutes: Router = Router();

AppRoutes.use('/rooms', RoomRoute);

AppRoutes.use('/videos', VideoRouter);
