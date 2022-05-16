import { ObjectType, Field, ID, Float } from '@nestjs/graphql'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { User, UserDocument } from '@app/users/entities/user.entity'
import { Document, Types } from 'mongoose'
import { ReadAt } from '@app/message/entities/readAt.entity'
import { Room, RoomDocument } from '@app/room/entities/room.entity'
import { License, LicenseDocument } from '@app/license/entities/license.entity'
import { Attach } from '@shared/attach/entities/attach.entity'

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
export class Message extends Attach {
  @Prop()
  @Field(() => String)
  content: string

  @Prop({
    default: [],
    type: [
      {
        user: {
          type: Types.ObjectId,
          ref: User.name,
          autopopulate: true,
          index: true
        },
        time: Number,
        _id: false
      }
    ]
  })
  @Field(() => [ReadAt])
  readAt: ReadAt[]
}

export const MessageEntity = SchemaFactory.createForClass(Message)
