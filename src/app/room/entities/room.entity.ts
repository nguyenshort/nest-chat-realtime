import { ObjectType, Field, Int, ID, Float } from '@nestjs/graphql'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { User, UserDocument } from '@app/users/entities/user.entity'

@ObjectType()
export class Room {
  @Field(() => ID)
  id: string

  @Prop()
  @Field(() => String)
  name: string

  @Prop()
  @Field(() => String, {
    nullable: true,
    defaultValue: 'https://i.imgur.com/LxX5gyy.png'
  })
  avatar: string

  @Prop({ type: [Types.ObjectId], ref: User.name, autopopulate: true })
  @Field(() => [User])
  users: UserDocument[]

  @Prop()
  @Field(() => Float)
  createdAt: number
}

export const RoomEntity = SchemaFactory.createForClass(Room)
