import { Router } from 'express'
import { serveImageController, serveVideoController } from '~/controllers/medias.controller'
import { requestHandler } from '~/utils/support'
const staticRouter = Router()

staticRouter.get('/image/:name', requestHandler(serveImageController))
staticRouter.get('/video/:name', requestHandler(serveVideoController))

export default staticRouter
