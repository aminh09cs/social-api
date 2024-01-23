import { Router } from 'express'
import { serveImageController } from '~/controllers/medias.controller'
import { requestHandler } from '~/utils/support'
const staticRouter = Router()

staticRouter.get('/image/:name', requestHandler(serveImageController))
export default staticRouter
