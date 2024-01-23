import { Request } from 'express'

import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

import { handleUploadImage } from '~/utils/file'
import { DIR, MediaType } from '~/utils/constant'
import { isProduction } from '~/utils/config'
import { Media } from '~/models/rest'

class MediaService {
  async handleUploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        await sharp(file.filepath)
          .jpeg()
          .toFile(path.resolve(DIR.UPLOAD_DIR, `${file.newFilename.split('.')[0]}.jpg`))
        fs.unlinkSync(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/web/static/image/${file.newFilename.split('.')[0]}.jpg`
            : `http://localhost:${process.env.PORT}/web/static/image/${file.newFilename.split('.')[0]}.jpg`,
          type: MediaType.Image
        }
      })
    )
    return result
  }
}
const mediaService = new MediaService()
export default mediaService
