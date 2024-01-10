import { Router } from 'express'
import {
  accessTokenValidator,
  verifyEmailValidator,
  updateMeValidator,
  followValidator,
  unfollowValidator
} from '~/middlewares/users.middleware'
import {
  meController,
  updateMeController,
  profileController,
  followController,
  unfollowController
} from '~/controllers/users.controller'
import { UpdateMeRequestBody } from '~/models/requests/user.request'
import { filterKeys } from '~/middlewares/filter.middleware'
import { requestHandler } from '~/utils/support'

const usersRouter: Router = Router()

usersRouter.get('/me', accessTokenValidator, requestHandler(meController))
usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifyEmailValidator,
  updateMeValidator,
  filterKeys<UpdateMeRequestBody>(['name', 'date_of_birth', 'bio', 'location', 'username', 'avatar']),
  requestHandler(updateMeController)
)
usersRouter.get('/:username', requestHandler(profileController))
usersRouter.post(
  '/follow',
  accessTokenValidator,
  verifyEmailValidator,
  followValidator,
  requestHandler(followController)
)

usersRouter.delete(
  '/follow/:user_id',
  accessTokenValidator,
  verifyEmailValidator,
  unfollowValidator,
  requestHandler(unfollowController)
)
export default usersRouter
