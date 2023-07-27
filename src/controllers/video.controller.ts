import { NextFunction, Request, Response } from 'express';
import * as path from 'path';
import { stat, mkdir, readdir, rm } from 'fs/promises';
import { createReadStream, createWriteStream, exists } from 'fs';
import { promisify } from 'util';

import axios from 'axios';
import * as m3u8Parser from 'm3u8-parser';

import { SelectVideoDto } from '../dto/select-video.dto';

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const existsAsync = promisify(exists);

const videoFolderPath = path.join(__dirname, '..', '..', 'public');
let selectedVideo = 'video.mp4';
const chunkSize = 1 * 1e6;
// const m3u8Url = 'https://prx.ukrtelcdn.net/cdbda5331144410dcbc0db05cf6b361d:2023072808:bGltcGxPVWRlUkcwTWNYRVQ3VldGMzIyZkowcDcvSDBpcHhzK3BEanNkWVZieEEyL3J4ck4zNTBiV0N5ZmNmZDYxeGZiQk1GT3MraGErVmdudlZHU1E9PQ==/3/7/0/2/9/8/fdfet.mp4:hls:manifest.m3u8';
const m3u8Url = 'https://prx.ukrtelcdn.net/8760993e45689686843523f399a32b0e:2023072813:bGltcGxPVWRlUkcwTWNYRVQ3VldGMzIyZkowcDcvSDBpcHhzK3BEanNkWVZieEEyL3J4ck4zNTBiV0N5ZmNmZFRiOE5hblV0OVF6c1ZJWm04SCtTNkE9PQ==/8/6/9/6/2/5/drxkg.mp4:hls:manifest.m3u8';
const m3u8UrlFilenameRegex = /\/([a-zA-Z0-9_-]+\.mp4)/;

export const VideoController = {
  getVideoContent: async (req: Request, res: Response, next: NextFunction) => {
    console.log('getting video content', req.headers.range);

    const videoPath = path.join(videoFolderPath, selectedVideo);
    const range = req.headers.range ? req.headers.range : '';
    const { size: videoSize } = await stat(videoPath);
    const start = Number(range.replace(/\D/g, ""))
    const end = Math.min(start + chunkSize, videoSize - 1)
    if (videoSize < start) {
      const err = new Error('range err');
      next(err);
    }

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

  streamFromM3U8: async (req: Request, res: Response, next: NextFunction) => {
    const videoUrl = 'https://prx.ukrtelcdn.net/9f92f588f2eb417a17c245df2e8c0382:2023072511:46e30097-17cc-4ef1-a1ec-2aa43e3903e2/4/7/2/5/8/2/p2dw4.mp4:hls:manifest.m3u8';
    try {
      const m3u8Manifest = await axios.get(videoUrl);
      const videoFileName = path.join(videoFolderPath, 'new.mp4')

    } catch (e) {
      next(e);
    }
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
  },

  getVideoFromM3U8: async (req: Request, res: Response, next: NextFunction) => {
    const m3u8Content = await fetchM3U8File(m3u8Url);
    console.log('m3u8Content', m3u8Content);
    if (m3u8Content) {
      const videoUrl = parseM3U8File(m3u8Content);
      console.log('m3u8Content', m3u8Content);
      if (videoUrl) {
        downloadVideo(videoUrl);
      }
    }
  },

  downloadM3U8Content: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const outputFileName = m3u8Url.match(m3u8UrlFilenameRegex)[1];
      if (!outputFileName) {
        next(new Error('bad m3u8 mp4 filename for output'));
      }

      const response = await axios.get(m3u8Url);
      const lines = response.data.split('\n');

      // Filter out comments and empty lines
      const segments = lines.filter((line) => !line.startsWith('#') && line.trim() !== '');

      // Create a temporary directory to store downloaded segments
      const tempDir = path.join(videoFolderPath, 'temp');
      const folderExist = await existsAsync(tempDir);
      if (!folderExist) {
        await mkdir(tempDir);
      }

      const promises = [];
      for (let i = 0; i < segments.length; i++) {
        const segmentUrl = new URL(segments[i], m3u8Url).toString();
        const segmentFileName = path.join(tempDir, `segment_${i}.ts`);
        promises.push(axios.get(segmentUrl, { responseType: 'stream' }).then((res) => {
          return new Promise((resolve, reject) => {
            const writer = createWriteStream(segmentFileName);
            res.data.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
          });
        }));
      }

      await Promise.all(promises);

      // Merge downloaded segments using ffmpeg
      const outputFile = path.join(videoFolderPath, outputFileName);
      try {
        await new Promise((resolve, reject) => {
          ffmpeg()
            .input('concat:' + segments.map((_, i) => path.join(tempDir, `segment_${i}.ts`)).join('|'))
            .output(outputFile)
            .on('end', resolve)
            .on('error', reject)
            .run();
        });
      } catch (e) {
        next(e);
      } finally {
        // Clean up temporary directory
        await rm(tempDir, { recursive: true, force: true });
      }

      console.log(`M3U8 content downloaded and saved as: ${outputFile}`);
    } catch (error) {
      console.error('Error downloading M3U8 content:', error);
    }
  }
}

// Function to fetch the .m3u8 file
async function fetchM3U8File(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching .m3u8 file:', error.message);
    return null;
  }
}

// Function to parse .m3u8 file and extract video URL(s)
function parseM3U8File(m3u8Content) {
  const parser = new m3u8Parser.Parser();
  parser.push(m3u8Content);
  parser.end();

  const parsedManifest = parser.manifest;
  if (!parsedManifest || !parsedManifest.segments || !parsedManifest.segments.length) {
    console.error('Invalid or empty .m3u8 manifest.');
    return null;
  }

  // Assuming the first video URL in the playlist is the highest quality available
  const videoUrl = parsedManifest.segments[0].uri;
  return videoUrl;
}

// Function to download the video from the extracted URL
async function downloadVideo(videoUrl) {
  try {
    const videoResponse = await axios.get(videoUrl, { responseType: 'stream' });
    const videoFileName = path.basename(videoUrl);
    const videoWriteStream = createWriteStream(videoFileName);
    videoResponse.data.pipe(videoWriteStream);
    console.log('Video download complete:', videoFileName);
  } catch (error) {
    console.error('Error downloading video:', error.message);
  }
}
