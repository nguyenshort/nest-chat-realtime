import { ObjectType, Field, Int, ID, Float } from '@nestjs/graphql'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { User, UserDocument } from '@app/users/entities/user.entity'
import { Document, Types } from 'mongoose'

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

  @Prop()
  @Field(() => String)
  content: string

  @Prop()
  @Field(() => String)
  roomID: string

  @Prop()
  @Field(() => String)
  appID: string

  @Prop()
  @Field(() => Float)
  createdAt: number

  @Prop({ type: Types.ObjectId, ref: User.name, autopopulate: true })
  @Field(() => User)
  from: UserDocument

  @Prop({ type: Types.ObjectId, ref: User.name, autopopulate: true })
  @Field(() => User)
  to: UserDocument
}

export const MessageEntity = SchemaFactory.createForClass(Message)
