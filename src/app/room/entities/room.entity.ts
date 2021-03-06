import { ObjectType, Field, ID, Float } from '@nestjs/graphql'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { User, UserDocument } from '@app/users/entities/user.entity'
import { License, LicenseDocument } from '@app/license/entities/license.entity'

export type RoomDocument = Room & Document

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
export class Room {
  @Field(() => ID)
  id: string

  @Prop({ type: Types.ObjectId, ref: License.name, autopopulate: true })
  license: LicenseDocument

  @Prop({ default: '' })
  @Field(() => String, { defaultValue: '' })
  name: string

  @Prop()
  @Field(() => String, {
    nullable: true,
    defaultValue: 'https://i.imgur.com/LxX5gyy.png'
  })
  avatar: string

  @Prop({
    type: [{ type: Types.ObjectId, ref: User.name, autopopulate: true }]
  })
  @Field(() => [User])
  users: UserDocument[]

  @Prop()
  @Field(() => Float)
  createdAt: number

  @Prop({ index: true })
  @Field(() => Float, { nullable: true, defaultValue: Date.now() })
  updatedAt: number
}

export const RoomEntity = SchemaFactory.createForClass(Room)
