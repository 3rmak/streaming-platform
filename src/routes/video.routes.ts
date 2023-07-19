import { Router, Request, Response } from "express";
import { VideoController } from '../controllers/video.controller';

export const VideoRouter = Router();

VideoRouter.get('/videoplayer', (req: Request, res: Response)=>{
  return VideoController.getVideoContent(req, res);
});

VideoRouter.get('/server-videos', (req: Request, res: Response)=>{
  return VideoController.getAvailableVideosFromFs(req, res);
});
