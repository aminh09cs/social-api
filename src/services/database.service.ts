import { MongoClient, Db, Collection } from 'mongodb'
import Follower from '~/models/schemas/follower.schema'
import RefreshToken from '~/models/schemas/refresh-token.schema'
import User from '~/models/schemas/user.schema'
import '~/utils/dotenv'

const url = `mongodb+srv://${process.env.DB_DATABASE_USERNAME}:${process.env.DB_DATABASE_PASSWORD}@xbackend.wrlhply.mongodb.net/?retryWrites=true&w=majority`
class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(url)
    this.db = this.client.db(process.env.DB_NAME || 'Social-Backend')
  }
  async connectDatabase() {
    try {
      // Send a ping to confirm a successful connection
      await this.client.connect()
      console.log('Successfully connected to Atlas')
    } catch (error: unknown) {
      throw new Error('Failed to connect to MongoDB: ' + error)
    }
  }
  get users(): Collection<User> {
    return this.db.collection(process.env.DB_COLLECTION_USERS as string)
  }
  get refresh_tokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_COLLECTION_REFRESH_TOKENS as string)
  }
  get followers(): Collection<Follower> {
    return this.db.collection(process.env.DB_COLLECTION_FOLLOWERS as string)
  }
  async createIndexUsers() {
    const isExistIndex = await this.users.indexExists(['email_1_password_1', 'email_1', 'username_1'])
    if (!isExistIndex) {
      this.users.createIndex({ email: 1, password: 1 })
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }, { unique: true })
    }
  }
  async createIndexRefreshTokens() {
    const isExistIndex = await this.users.indexExists(['token_1', 'exp_1'])
    if (!isExistIndex) {
      this.refresh_tokens.createIndex({ token: 1 })
      this.refresh_tokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 })
    }
  }
  async createIndexFollowers() {
    const isExistIndex = await this.users.indexExists(['user_id_1_followed_user_id_1'])
    if (!isExistIndex) {
      this.followers.createIndex({ user_id: 1, followed_user_id: 1 })
    }
  }
}

const databaseService = new DatabaseService()
export default databaseService
