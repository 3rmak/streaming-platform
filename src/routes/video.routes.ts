import { Router, Request, Response, NextFunction } from 'express';
import { VideoController } from '../controllers/video.controller';
import { ValidationMiddleware } from '../middlewares/validation.middleware';
import { SelectVideoDto } from '../dto/select-video.dto';

export const VideoRouter = Router();

VideoRouter.get('/videoplayer', (req: Request, res: Response)=>{
  return VideoController.getVideoContent(req, res);
});

VideoRouter.get('/server-videos', (req: Request, res: Response, next: NextFunction)=>{
  return VideoController.getAvailableVideosFromFs(req, res, next);
});

VideoRouter.post('/select', [ValidationMiddleware(SelectVideoDto)],
  (req: Request, res: Response, next: NextFunction)=>{
  return VideoController.selectVideoFromFs(req, res, next);
});
