import { ObjectType, Field, ID, Float } from '@nestjs/graphql'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { User, UserDocument } from '@app/users/entities/user.entity'
import { Document, Types } from 'mongoose'
import { ReadAt } from '@app/message/entities/readAt.entity'
import { Room, RoomDocument } from '@app/room/entities/room.entity'

export type MessageDocument = Message & Document

@Schema({
  toJSON: {
    virtuals: true,
    getters: true
  },
  toObject: {
    virtuals: true,
    getters: true
  }
})
@ObjectType()
export class Message {
  @Field(() => ID)
  id: string

  @Prop({ type: Types.ObjectId, ref: User.name, autopopulate: true })
  @Field(() => User)
  from: UserDocument

  @Prop({ type: Types.ObjectId, ref: User.name, autopopulate: true })
  @Field(() => User)
  to: UserDocument

  @Prop()
  @Field(() => String)
  content: string

  @Prop({
    type: Types.ObjectId,
    ref: Room.name,
    autopopulate: true
  })
  @Field(() => Room)
  room: RoomDocument

  @Prop()
  @Field(() => String)
  appID: string

  @Prop()
  @Field(() => [ReadAt])
  readAt: ReadAt[]

  @Prop()
  @Field(() => Float)
  createdAt: number
}

export const MessageEntity = SchemaFactory.createForClass(Message)
