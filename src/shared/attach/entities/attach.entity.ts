import { ObjectType, Field, ID, Float } from '@nestjs/graphql'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { User, UserDocument } from '@app/users/entities/user.entity'
import { Document, Types } from 'mongoose'
import { Room, RoomDocument } from '@app/room/entities/room.entity'
import { License, LicenseDocument } from '@app/license/entities/license.entity'

export type AttachDocument = Attach & Document

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
export class Attach {
  @Field(() => ID)
  id: string

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    autopopulate: true,
    index: true
  })
  @Field(() => User)
  from: UserDocument

  @Prop({
    type: Types.ObjectId,
    ref: Room.name,
    autopopulate: true,
    index: true
  })
  @Field(() => Room)
  room: RoomDocument

  @Prop({
    type: Types.ObjectId,
    ref: License.name,
    autopopulate: true,
    index: true
  })
  @Field(() => License)
  license: LicenseDocument

  @Prop()
  @Field(() => Float)
  createdAt: number
}

export const AttachEntity = SchemaFactory.createForClass(Attach)
