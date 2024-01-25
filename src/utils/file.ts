import fs from 'fs'
import formidable from 'formidable'

import { Request } from 'express'

import { File } from 'formidable'
import { ErrorStatus } from '~/models/error-status'
import { HTTP_STATUS } from './constant'
import { DIR } from './constant'

export const createFolder = () => {
  ;[DIR.UPLOAD_IMAGE_TEMP_DIR, DIR.UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })
}

export const handleUploadImage = async (req: Request) => {
  const form = formidable({
    uploadDir: DIR.UPLOAD_IMAGE_TEMP_DIR,
    maxFiles: 4,
    keepExtensions: true,
    maxFileSize: 300 * 1024, //300kb
    maxTotalFileSize: 300 * 1024 * 4,
    filter: function ({ name, originalFilename, mimetype }) {
      const isValid = name === 'image' && Boolean(mimetype?.includes('image/'))

      if (!isValid) {
        console.log(isValid)
        form.emit(
          'error' as any,
          new ErrorStatus({ message: 'File type is invalid', status: HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE }) as any
        )
      }
      return isValid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!files.image) {
        return reject(
          new ErrorStatus({ message: 'File type is not empty', status: HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE })
        )
      }
      resolve(files.image)
    })
  })
}

export const handleUploadVideo = async (req: Request) => {
  const form = formidable({
    uploadDir: DIR.UPLOAD_VIDEO_DIR,
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 30 * 1024 * 1024, //30mb
    filter: function ({ name, originalFilename, mimetype }) {
      const isValid = name === 'video' && Boolean(mimetype?.includes('mp4'))

      if (!isValid) {
        console.log(isValid)
        form.emit(
          'error' as any,
          new ErrorStatus({ message: 'File type is invalid', status: HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE }) as any
        )
      }
      return isValid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      console.log(files)
      if (err) {
        return reject(err)
      }
      if (!files.video) {
        return reject(
          new ErrorStatus({ message: 'File type is not empty', status: HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE })
        )
      }
      resolve(files.video)
    })
  })
}
