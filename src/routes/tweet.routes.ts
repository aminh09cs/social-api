import { Router } from 'express'

import { createTweetController } from '~/controllers/tweets.controller'
import { accessTokenValidator, verifyEmailValidator } from '~/middlewares/users.middleware'
import { requestHandler } from '~/utils/support'
const tweetsRouter: Router = Router()

tweetsRouter.post('/', accessTokenValidator, verifyEmailValidator, requestHandler(createTweetController))

export default tweetsRouter
