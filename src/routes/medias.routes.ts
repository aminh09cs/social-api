import { Router } from 'express'

import { uploadImageController } from '~/controllers/medias.controller'
import { requestHandler } from '~/utils/support'
const mediasRouter: Router = Router()

mediasRouter.post('/upload-image', requestHandler(uploadImageController))

export default mediasRouter
