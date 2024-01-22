import { Request } from 'express'

import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

import { handleUploadSingleFile } from '~/utils/file'
import { DIR } from '~/utils/constant'

class MediaService {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadSingleFile(req)
    await sharp(file.filepath)
      .jpeg()
      .toFile(path.resolve(DIR.UPLOAD_DIR, `${file.newFilename.split('.')[0]}.jpg`))
    fs.unlinkSync(file.filepath)
    return `https://localhost:4000/uploads/${file.newFilename.split('.')[0]}.jpg`
  }
}
const mediaService = new MediaService()
export default mediaService
