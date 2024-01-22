import { Request, Response, NextFunction } from 'express'
import mediaService from '~/services/media.service'
export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediaService.handleUploadSingleImage(req)
  return res.json({
    result: result
  })
}
