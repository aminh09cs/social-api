import { Router } from 'express'

import { uploadSingleImageController } from '~/controllers/medias.controller'
import { requestHandler } from '~/utils/support'
const mediasRouter: Router = Router()

mediasRouter.post('/upload-image', requestHandler(uploadSingleImageController))

export default mediasRouter
