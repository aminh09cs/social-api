import { Router } from 'express'
import authRouter from './auth.routes'
import usersRouter from './users.routes'
import mediasRouter from './medias.routes'
import staticRouter from './static.routes'

const router: Router = Router()

router.use('/auth', authRouter)
router.use('/user', usersRouter)
router.use('/media', mediasRouter)
router.use('/static', staticRouter)

export const MainRouter: Router = router
