import { Request, Response, NextFunction } from 'express'
import path from 'path'
import mediaService from '~/services/media.service'

import { ServeImageParams } from '~/models/requests/user.request'
import { DIR } from '~/utils/constant'

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediaService.handleUploadImage(req)
  return res.json({
    message: 'Upload successfully',
    result: url
  })
}

export const serveImageController = async (req: Request<ServeImageParams>, res: Response, next: NextFunction) => {
  const { name } = req.params
  return res.sendFile(path.resolve(DIR.UPLOAD_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).json({ message: 'Image not found' })
    }
  })
}
