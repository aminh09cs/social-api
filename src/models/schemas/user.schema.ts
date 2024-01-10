import { ObjectId } from 'mongodb'
import { UserVerifyStatusType } from 'src/utils/constant'

interface UserType {
  _id?: ObjectId
  name: string
  email: string
  password: string
  date_of_birth: Date
  create_at?: Date
  update_at?: Date
  email_verify_token?: string
  forgot_password_token?: string
  verify?: UserVerifyStatusType
  bio?: string
  location?: string
  username?: string
  avatar?: string
}

export default class User {
  _id?: ObjectId
  name: string
  email: string
  password: string
  date_of_birth: Date
  create_at: Date
  update_at: Date
  email_verify_token: string
  forgot_password_token: string
  verify: UserVerifyStatusType
  bio: string
  location: string
  username: string
  avatar: string

  constructor(user: UserType) {
    const innitiated_date = new Date()
    this._id = user._id
    this.name = user.name || ''
    this.email = user.email
    this.password = user.password
    this.date_of_birth = user.date_of_birth || new Date()
    this.create_at = user.create_at || innitiated_date
    this.update_at = user.update_at || innitiated_date
    this.email_verify_token = user.email_verify_token || ''
    this.forgot_password_token = user.forgot_password_token || ''
    this.verify = user.verify || UserVerifyStatusType.Unverified
    this.bio = user.bio || ''
    this.location = user.location || ''
    this.username = user.username || ''
    this.avatar = user.avatar || ''
  }
}
