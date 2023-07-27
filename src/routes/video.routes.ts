import { Router, Request, Response, NextFunction } from 'express';
import { VideoController } from '../controllers/video.controller';
import { ValidationMiddleware } from '../middlewares/validation.middleware';
import { SelectVideoDto } from '../dto/select-video.dto';

export const VideoRouter = Router();

VideoRouter.get('/videoplayer', (req: Request, res: Response, next: NextFunction)=>{
  return VideoController.getVideoContent(req, res, next);
});

VideoRouter.get('/server-videos', (req: Request, res: Response, next: NextFunction)=>{
  return VideoController.getAvailableVideosFromFs(req, res, next);
});

// [ValidationMiddleware(SelectVideoDto)]
VideoRouter.post('/select',
  (req: Request, res: Response, next: NextFunction)=>{
  return VideoController.selectVideoFromFs(req, res, next);
});

VideoRouter.get('/download',
(req: Request, res: Response, next: NextFunction)=>{
  return VideoController.downloadM3U8Content(req, res, next);
});
