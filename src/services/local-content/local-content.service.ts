import { Request, Response } from 'express';
import fs from 'fs';
import { BAD_REQUEST, PARTIAL_CONTENT } from 'http-status';

let localVideoName = 'dead_poet_society.mp4';

export const LocalContentService = {
  getLocalContent: (req: Request, res: Response) => {
    const range = req.headers.range;
    if (!range) {
      return res.status(BAD_REQUEST).send('Requires Range header');
    }

    const videoSize = fs.statSync(localVideoName).size;

    // Parse Range
    // Example: "bytes=32324-"
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    // Create headers
    const contentLength = end - start + 1;
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': 'video/mp4',
    };

    // HTTP Status 206 for Partial Content
    res.writeHead(PARTIAL_CONTENT, headers);

    // create video read stream for this particular chunk
    const videoStream = fs.createReadStream(localVideoName, { start, end });

    // Stream the video chunk to the client
    return videoStream.pipe(res);
  },

  setCustomLocalVideo: (req: Request, res: Response) => {
    const videoName = req.body['video-name'];
    if (!videoName) {
      return res.status(BAD_REQUEST).send('Requires Range header');
    }

    localVideoName = videoName;
    console.log(`NEW NAME IS ${videoName}`);

    return res.send();
  },
};
