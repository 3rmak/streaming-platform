import { NextFunction, Request, Response } from 'express';
import * as path from 'path';
import { stat, readdir } from 'fs/promises';
import { createReadStream } from 'fs';

import { SelectVideoDto } from '../dto/select-video.dto';

const videoFolderPath = path.join(__dirname, '..', '..', 'public');
let selectedVideo = 'video.mp4';
const chunkSize = 1 * 1e6;

export const VideoController = {
  getVideoContent: async (req: Request, res: Response) => {
    console.log('getting video content', req.headers.range);

    const videoPath = path.join(videoFolderPath, selectedVideo);
    const range = req.headers.range ? req.headers.range : '';
    const { size: videoSize } = await stat(videoPath);
    // const videoSize = fs.statSync(videoPath).size
    const start = Number(range.replace(/\D/g, ""))
    const end = Math.min(start + chunkSize, videoSize - 1)
    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4"
    }
    res.writeHead(206, headers)
    const stream = createReadStream(videoPath, {
      start,
      end
    })
    stream.pipe(res);
  },

  getAvailableVideosFromFs: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const folderContent = await readdir(videoFolderPath, { encoding: 'utf-8' });
      return res.json(folderContent);
    } catch (e) {
      next(e);
    }
  },

  selectVideoFromFs: async (req: Request, res: Response, next: NextFunction) => {
    const dto: SelectVideoDto = req.body;
    const folderContent = await readdir(videoFolderPath, { encoding: 'utf-8' });
    const videoObject = folderContent.find((str) => str == dto.videoName);
    if (!videoObject) {
      next(new Error(`video with name: ${dto.videoName} isn't found`));
    }

    selectedVideo = dto.videoName;
    return res.send({ selected: selectedVideo });
  }
}
