import { Router } from 'express'

import { uploadImageController, uploadVideoController } from '~/controllers/medias.controller'
import { accessTokenValidator, verifyEmailValidator } from '~/middlewares/users.middleware'
import { requestHandler } from '~/utils/support'
const mediasRouter: Router = Router()

mediasRouter.post('/upload-image', accessTokenValidator, verifyEmailValidator, requestHandler(uploadImageController))

mediasRouter.post('/upload-video', accessTokenValidator, verifyEmailValidator, requestHandler(uploadVideoController))

export default mediasRouter
