import { ObjectId } from 'mongodb'
import { TweetType, TweetAudience, MediaType } from '~/utils/constant'

interface _TweetType {
  _id?: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: ObjectId | null
  hashtags: ObjectId
  mentions: ObjectId
  medias: MediaType[]
  guest_views: number
  user_views: number
  created_at?: Date
  updated_at?: Date
}
export default class Tweet {
  _id?: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: ObjectId | null
  hashtags: ObjectId
  mentions: ObjectId
  medias: MediaType[]
  guest_views: number
  user_views: number
  created_at: Date
  updated_at: Date

  constructor({
    _id,
    user_id,
    type,
    audience,
    content,
    parent_id,
    hashtags,
    mentions,
    medias,
    guest_views,
    user_views,
    created_at,
    updated_at
  }: _TweetType) {
    const initiated_date = new Date()
    this._id = _id
    this.user_id = user_id
    this.type = type
    this.audience = audience
    this.content = content
    this.parent_id = parent_id
    this.hashtags = hashtags
    this.mentions = mentions
    this.medias = medias
    this.guest_views = guest_views
    this.user_views = user_views
    this.created_at = created_at || initiated_date
    this.updated_at = updated_at || initiated_date
  }
}
