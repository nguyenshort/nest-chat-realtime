import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { Field, Float, ID, ObjectType } from '@nestjs/graphql'
import GraphQLJSON from 'graphql-type-json'
export type UserDocument = User & Document

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
export class User {
  @Field(() => ID)
  id: string

  @Prop({ required: true })
  @Field(() => String)
  name: string

  // unique sẽ không có tác dụng
  @Prop({ required: true, unique: true, index: true })
  @Field(() => String)
  email: string

  @Prop()
  @Field(() => String)
  appID: string

  @Prop({ type: Object, default: {} })
  @Field(() => GraphQLJSON)
  meta: JSON

  @Prop()
  @Field(() => String, {
    nullable: true,
    defaultValue: 'https://i.imgur.com/pqGLgGr.jpg'
  })
  avatar: string

  @Prop()
  @Field(() => Float)
  createdAt: number
}

export const UserEntity = SchemaFactory.createForClass(User)
