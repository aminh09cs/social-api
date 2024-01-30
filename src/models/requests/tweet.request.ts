import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType } from '~/utils/constant'

export interface TweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: ObjectId | null
  hashtags: ObjectId
  mentions: ObjectId
  medias: MediaType[]
}
