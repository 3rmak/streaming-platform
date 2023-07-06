import { Router } from 'express';

import { RoomRoute } from './room.route';

export const AppRoutes: Router = Router();

AppRoutes.use('/rooms', RoomRoute);