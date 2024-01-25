import { Request, Response, NextFunction } from 'express'
import path from 'path'
import fs from 'fs'
import mime from 'mime'
import mediaService from '~/services/media.service'
import { ServeImageParams, ServeVideoParams } from '~/models/requests/user.request'
import { DIR, HTTP_STATUS, MESSAGES } from '~/utils/constant'
import { ErrorStatus } from '~/models/error-status'

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediaService.handleUploadImage(req)
  return res.json({
    message: 'Upload image successfully',
    result: url
  })
}

export const uploadVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediaService.handleUploadVideo(req)

  return res.json({
    message: 'Upload video successfully',
    result: url
  })
}

export const serveImageController = async (req: Request<ServeImageParams>, res: Response, next: NextFunction) => {
  const { name } = req.params
  return res.sendFile(path.resolve(DIR.UPLOAD_IMAGE_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).json({ message: 'Image not found' })
    }
  })
}

export const serveVideoController = async (req: Request<ServeVideoParams>, res: Response, next: NextFunction) => {
  const range = req.headers.range
  const { name } = req.params

  if (!range) throw new ErrorStatus({ message: MESSAGES.REQUIRES_RANGE_HEADER, status: HTTP_STATUS.BAD_REQUEST })

  const videoPath = path.resolve(DIR.UPLOAD_VIDEO_DIR, name)
  const videoSize = fs.statSync(videoPath).size

  const chunkSize = 10 ** 6

  const start = Number(range.replace(/\D/g, ''))
  const end = Math.min(start + chunkSize, videoSize - 1)

  const contentLength = end - start + 1
  const contentType = mime.getType(videoPath) || 'video/*'

  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }
  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers)
  const videoStream = fs.createReadStream(videoPath, { start, end })
  videoStream.pipe(res)
}
