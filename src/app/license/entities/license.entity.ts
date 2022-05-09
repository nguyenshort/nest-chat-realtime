import { ObjectType, Field, Float, ID } from '@nestjs/graphql'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type LicenseDocument = License & Document

@Schema({
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
})
@ObjectType()
export class License {
  @Field(() => ID)
  id: string

  @Prop({ index: true, required: true })
  @Field(() => String, { description: 'Mã định danh app' })
  appID: string

  @Prop({})
  @Field(() => Float, { description: 'Ngày tạo license' })
  createdAt: number
}

export const LicenseSchema = SchemaFactory.createForClass(License)

@ObjectType()
export class Token {
  @Field(() => String)
  token: string
}
