import { Router } from 'express'
import authRouter from './auth.routes'
import usersRouter from './users.routes'
import mediasRouter from './medias.routes'

const router: Router = Router()

router.use('/auth', authRouter)
router.use('/user', usersRouter)
router.use('/media', mediasRouter)

export const MainRouter: Router = router
