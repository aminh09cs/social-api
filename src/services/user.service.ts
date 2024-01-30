import { ObjectId } from 'mongodb'
import { RegisterRequestBody, UpdateMeRequestBody } from '~/models/requests/user.request'

import databaseService from './database.service'
import User from '~/models/schemas/user.schema'
import RefreshToken from '~/models/schemas/refresh-token.schema'
import Follower from '~/models/schemas/follower.schema'
import { signToken, verifyToken } from '~/utils/jwt'
import { ErrorStatus } from '~/models/error-status'
import { hashPassword } from '~/utils/crypto'
import { HTTP_STATUS, TokenType, UserVerifyStatusType } from '~/utils/constant'

class UserService {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatusType }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        verify
      },
      privateKey: process.env.JWT_ACCESS_TOKEN_KEY as string,
      options: { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN }
    })
  }
  private signRefreshToken({ user_id, verify, exp }: { user_id: string; verify: UserVerifyStatusType; exp?: number }) {
    if (exp) {
      return signToken({
        payload: {
          user_id,
          token_type: TokenType.RefreshToken,
          verify,
          exp
        },
        privateKey: process.env.JWT_REFRESH_TOKEN_KEY as string
      })
    }
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        verify
      },
      privateKey: process.env.JWT_REFRESH_TOKEN_KEY as string,
      options: { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN }
    })
  }

  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatusType }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
        verify
      },
      privateKey: process.env.JWT_EMAIL_VERIFY_TOKEN_KEY as string,
      options: { expiresIn: process.env.JWT_EMAIL_VERIFY_TOKEN_EXPIRES_IN }
    })
  }

  private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatusType }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken,
        verify
      },
      privateKey: process.env.JWT_FORGOT_PASSWORD_TOKEN_KEY as string,
      options: { expiresIn: process.env.JWT_FORGOT_PASSWORD_TOKEN_EXPIRES_IN }
    })
  }
  private decodedRefreshToken({ refresh_token }: { refresh_token: string }) {
    return verifyToken({
      token: refresh_token,
      secretKey: process.env.JWT_REFRESH_TOKEN_KEY as string
    })
  }

  async register(payload: RegisterRequestBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatusType.Unverified
    })
    databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        username: `user_${user_id.toString()}`,
        email_verify_token,
        password: hashPassword(payload.password),
        date_of_birth: new Date(payload.date_of_birth)
      })
    )
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken({ user_id: user_id.toString(), verify: UserVerifyStatusType.Unverified }),
      this.signRefreshToken({ user_id: user_id.toString(), verify: UserVerifyStatusType.Unverified })
    ])
    return { access_token, refresh_token }
  }
  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatusType }) {
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken({ user_id: user_id.toString(), verify: verify }),
      this.signRefreshToken({ user_id: user_id.toString(), verify: verify })
    ])
    const { iat, exp } = await this.decodedRefreshToken({ refresh_token })
    if (!iat || !exp) return
    await databaseService.refresh_tokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, iat, exp })
    )
    return { access_token, refresh_token }
  }

  async logout({ token }: { token: string }) {
    await databaseService.refresh_tokens.deleteOne({ token })
  }

  async refreshToken({
    user_id,
    verify,
    refresh_token,
    exp
  }: {
    user_id: string
    verify: UserVerifyStatusType
    refresh_token: string
    exp: number
  }) {
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken({ user_id: user_id.toString(), verify: verify }),
      this.signRefreshToken({ user_id: user_id.toString(), verify: verify, exp: exp }),
      databaseService.refresh_tokens.deleteOne({ token: refresh_token })
    ])
    const { iat } = await this.decodedRefreshToken({ refresh_token: new_refresh_token })
    if (!iat || !exp) return
    await databaseService.refresh_tokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: new_refresh_token, iat, exp })
    )
    return {
      access_token: new_access_token,
      refresh_token: new_refresh_token
    }
  }

  async isEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }
  async verifyEmail({ user_id }: { user_id: string }) {
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken({ user_id: user_id.toString(), verify: UserVerifyStatusType.Verified }),
      this.signRefreshToken({ user_id: user_id.toString(), verify: UserVerifyStatusType.Verified }),
      databaseService.users.updateOne(
        { _id: new ObjectId(user_id) },
        {
          $set: {
            email_verify_token: '',
            verify: UserVerifyStatusType.Verified
          },
          $currentDate: {
            update_at: true
          }
        }
      )
    ])

    const { iat, exp } = await this.decodedRefreshToken({ refresh_token })
    if (!iat || !exp) return
    console.log('hehe', {
      refresh_token: refresh_token,
      user_id: user_id,
      iat: iat,
      exp: exp
    })
    await databaseService.refresh_tokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, iat, exp })
    )
    return { access_token, refresh_token }
  }

  async resendEmail({ user_id }: { user_id: string }) {
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id,
      verify: UserVerifyStatusType.Unverified
    })
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          email_verify_token,
          verify: UserVerifyStatusType.Unverified
        },
        $currentDate: {
          update_at: true
        }
      }
    )
  }
  async forgotPassword(user: User) {
    const { _id, verify } = user
    const forgot_password_token = await this.signForgotPasswordToken({
      user_id: _id?.toString() as string,
      verify: verify
    })
    await databaseService.users.updateOne(
      { _id: _id },
      {
        $set: {
          forgot_password_token
        },
        $currentDate: {
          update_at: true
        }
      }
    )
  }
  async resetPassword({ user_id, password }: { user_id: string; password: string }) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          password: hashPassword(password),
          forgot_password_token: ''
        },
        $currentDate: {
          update_at: true
        }
      }
    )
  }
  async changePassword({ user_id, new_password }: { user_id: string; new_password: string }) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          password: hashPassword(new_password)
        },
        $currentDate: {
          update_at: true
        }
      }
    )
  }
  async getMe({ user_id }: { user_id: string }) {
    const user = await databaseService.users.findOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        projection: {
          _id: 0,
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    if (user) return user
  }
  async updateMe({ user_id, payload }: { user_id: string; payload: UpdateMeRequestBody }) {
    const payloadClone = {
      ...payload,
      date_of_birth: payload.date_of_birth ? new Date(payload.date_of_birth) : Date
    } as UpdateMeRequestBody & { date_of_birth: Date }
    const user = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          ...payloadClone
        },
        $currentDate: {
          update_at: true
        }
      },
      {
        projection: {
          _id: 0,
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        },
        returnDocument: 'after'
      }
    )
    if (user) return user
  }
  async getProfile({ username }: { username: string }) {
    const user = await databaseService.users.findOne(
      { username },
      {
        projection: {
          _id: 0,
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    if (user) return user
    throw new ErrorStatus({ message: 'User not found', status: HTTP_STATUS.NOT_FOUND })
  }
  async follow({ user_id, followed_user_id }: { user_id: string; followed_user_id: string }) {
    const followers = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    if (!followers) {
      await databaseService.followers.insertOne(
        new Follower({
          user_id: new ObjectId(user_id),
          followed_user_id: new ObjectId(followed_user_id)
        })
      )
      return {
        message: 'Followed Successfully'
      }
    }
    return {
      message: 'User is followed before'
    }
  }
  async unfollow(user_id: string, followed_user_id: string) {
    const followers = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    if (!followers) {
      return {
        message: 'Already Unfollowed'
      }
    }
    await databaseService.followers.deleteOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    return {
      message: 'Unfollowed Successfully'
    }
  }
}

const userService = new UserService()
export default userService
